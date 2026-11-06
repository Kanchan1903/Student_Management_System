#!/usr/bin/env node
/**
 * Remote HTTP MCP Server for Student Management System
 * Uses official Model Context Protocol (MCP) Streamable HTTP Transport.
 *
 * Exposes:
 *   - POST /mcp    : Handles initialization and JSON-RPC tool calls
 *   - GET  /mcp    : Handles persistent SSE stream per session
 *   - DELETE /mcp  : Handles explicit session teardown
 *   - GET  /health : Health check for Render / orchestrators
 *   - GET  /       : Service info endpoint
 *
 * Config via environment variables:
 *   - PORT         : Port to listen on (Render provides this, defaults to 5001)
 *   - BACKEND_URL  : Public URL of deployed backend API (defaults to Render backend)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createStudentMcpServer } = require('./mcp-tools.js');

const PORT = parseInt(process.env.PORT, 10) || 5001;
const HOST = '0.0.0.0';
const BACKEND_URL =
  process.env.BACKEND_URL || 'https://student-management-system-ytsf.onrender.com';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'mcp-session-id',
      'mcp-protocol-version',
      'accept',
      'last-event-id',
    ],
    exposedHeaders: ['mcp-session-id', 'mcp-protocol-version'],
  })
);

app.use(express.json({ limit: '10mb' }));

// ─── Session Management ───────────────────────────────────────────────────────
/**
 * Map of sessionId -> { transport: StreamableHTTPServerTransport, server: McpServer, lastActive: number }
 */
const sessions = new Map();

// Periodic cleanup of idle sessions (idle > 1 hour)
const SESSION_TTL_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      console.log(`[MCP-HTTP] Cleaning up idle session: ${id}`);
      try {
        session.transport.close();
      } catch (err) {
        console.error(`[MCP-HTTP] Error closing idle session ${id}:`, err.message);
      }
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000).unref();

// ─── Health & Info Endpoints ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'student-management-mcp-http',
    version: '1.0.0',
    transport: 'Streamable HTTP (MCP SDK 1.32+)',
    backendUrl: BACKEND_URL,
    activeSessions: sessions.size,
    endpoints: {
      mcp: '/mcp',
      health: '/health',
    },
    tools: [
      'list_students',
      'get_student',
      'get_stats',
      'create_student',
      'update_student',
      'delete_student',
    ],
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    activeSessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

// ─── MCP Streamable HTTP Route ────────────────────────────────────────────────
app.all('/mcp', async (req, res) => {
  try {
    const rawSessionId = req.headers['mcp-session-id'];
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

    let transport;

    if (sessionId) {
      // Existing session lookup
      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: `Session not found: ${sessionId}`,
          },
        });
      }
      session.lastActive = Date.now();
      transport = session.transport;
    } else if (req.method === 'POST') {
      // New session initialization
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          console.log(`[MCP-HTTP] New session initialized: ${id}`);
          sessions.set(id, {
            transport,
            server,
            lastActive: Date.now(),
          });
        },
        onsessionclosed: (id) => {
          console.log(`[MCP-HTTP] Session closed: ${id}`);
          sessions.delete(id);
        },
      });

      // Create new MCP server with the tools connected to backend
      const server = createStudentMcpServer(BACKEND_URL);
      await server.connect(transport);
    } else {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Mcp-Session-Id header is required for non-initialization requests',
        },
      });
    }

    // Delegate HTTP request processing to StreamableHTTPServerTransport
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP-HTTP] Error processing request:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error: ' + err.message,
        },
      });
    }
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const httpServer = app.listen(PORT, HOST, () => {
  console.log('────────────────────────────────────────────────────────────');
  console.log(`🎓 Student Management MCP HTTP Server is running`);
  console.log(`📍 Listening on: http://${HOST}:${PORT}`);
  console.log(`🔗 MCP Endpoint: http://${HOST}:${PORT}/mcp`);
  console.log(`🎯 Targeting Backend: ${BACKEND_URL}`);
  console.log('────────────────────────────────────────────────────────────');
});

async function shutdown() {
  console.log('\n[MCP-HTTP] Shutting down gracefully...');
  for (const [id, session] of sessions.entries()) {
    try {
      await session.transport.close();
    } catch (_) {}
  }
  sessions.clear();
  httpServer.close(() => {
    console.log('[MCP-HTTP] Server terminated.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
