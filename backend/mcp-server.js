#!/usr/bin/env node
/**
 * MCP Server for Student Management System (STDIO Transport)
 *
 * Compatible with Claude Desktop, Antigravity, and CLI agents.
 * Reuses tools defined in mcp-tools.js.
 *
 * Usage:
 *   node mcp-server.js
 */

require('dotenv').config();
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createStudentMcpServer } = require('./mcp-tools.js');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const server = createStudentMcpServer(BACKEND_URL);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`🎓 Student Management MCP Server started (stdio) -> targeting ${BACKEND_URL}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
