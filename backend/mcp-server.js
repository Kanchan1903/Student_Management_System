#!/usr/bin/env node
/**
 * MCP Server for Student Management System
 *
 * Exposes the following tools to any MCP-compatible AI agent (e.g. Claude):
 *   - list_students      : Get all students (with optional search/filter)
 *   - get_student        : Get a single student by MongoDB _id
 *   - get_stats          : Dashboard statistics (totals, by dept, by semester)
 *   - create_student     : Add a new student record
 *   - update_student     : Update an existing student record
 *   - delete_student     : Delete a student record
 *
 * Transport: stdio (Claude Desktop / Antigravity compatible)
 *
 * Usage:
 *   node mcp-server.js
 *
 * Prerequisites:
 *   - Backend REST API must be running on http://localhost:5000
 *     (or set BACKEND_URL env var to point elsewhere)
 */

require('dotenv').config();
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

// ─── Config ───────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

// ─── HTTP Helper ──────────────────────────────────────────────────────────────
async function apiRequest(method, path, body = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (!data.success && res.status >= 400) {
    throw new Error(data.message || `HTTP ${res.status} error`);
  }
  return data;
}

// ─── Department enum (mirrors Mongoose schema) ────────────────────────────────
const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Commerce',
  'Arts',
  'Other',
];

// ─── MCP Server ───────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'student-management-mcp',
  version: '1.0.0',
});

// ── Tool: list_students ───────────────────────────────────────────────────────
server.tool(
  'list_students',
  'Retrieve a list of students. Supports optional search by name/email/studentId, filter by department or semester, and pagination.',
  {
    search: z.string().optional().describe('Search query matching name, studentId, or email'),
    department: z.enum(DEPARTMENTS).optional().describe('Filter by department'),
    semester: z.number().int().min(1).max(8).optional().describe('Filter by semester (1–8)'),
    page: z.number().int().min(1).default(1).describe('Page number (default: 1)'),
    limit: z.number().int().min(1).max(500).default(100).describe('Results per page (default: 100)'),
  },
  async ({ search, department, semester, page, limit }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (department) params.set('department', department);
    if (semester) params.set('semester', String(semester));
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));

    const query = params.toString() ? `?${params}` : '';
    const result = await apiRequest('GET', `/students${query}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: result.total,
              count: result.count,
              page: result.page,
              students: result.data,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: get_student ─────────────────────────────────────────────────────────
server.tool(
  'get_student',
  'Retrieve a single student by their MongoDB _id.',
  {
    id: z.string().describe('MongoDB ObjectId of the student'),
  },
  async ({ id }) => {
    const result = await apiRequest('GET', `/students/${id}`);
    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }
);

// ── Tool: get_stats ───────────────────────────────────────────────────────────
server.tool(
  'get_stats',
  'Get dashboard statistics: total students, breakdown by department and semester, and recent additions in the last 7 days.',
  {},
  async () => {
    const result = await apiRequest('GET', '/students/stats');
    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  }
);

// ── Tool: create_student ──────────────────────────────────────────────────────
server.tool(
  'create_student',
  'Add a new student record to the database.',
  {
    studentId: z.string().describe('Unique student ID (e.g. CS2024001)'),
    name: z.string().min(2).max(100).describe('Full name of the student'),
    email: z.string().email().describe('Email address of the student'),
    department: z.enum(DEPARTMENTS).describe('Department the student belongs to'),
    semester: z.number().int().min(1).max(8).describe('Current semester (1–8)'),
    contact: z.string().optional().describe('Contact number (optional, 7–15 digits)'),
  },
  async ({ studentId, name, email, department, semester, contact }) => {
    const body = { studentId, name, email, department, semester };
    if (contact) body.contact = contact;

    const result = await apiRequest('POST', '/students', body);
    return {
      content: [
        {
          type: 'text',
          text: `✅ ${result.message}\n\n${JSON.stringify(result.data, null, 2)}`,
        },
      ],
    };
  }
);

// ── Tool: update_student ──────────────────────────────────────────────────────
server.tool(
  'update_student',
  'Update an existing student record by MongoDB _id. All fields except contact are required.',
  {
    id: z.string().describe('MongoDB ObjectId of the student to update'),
    studentId: z.string().describe('Student ID (can be the same or a new unique one)'),
    name: z.string().min(2).max(100).describe('Full name'),
    email: z.string().email().describe('Email address'),
    department: z.enum(DEPARTMENTS).describe('Department'),
    semester: z.number().int().min(1).max(8).describe('Semester (1–8)'),
    contact: z.string().optional().describe('Contact number (optional)'),
  },
  async ({ id, studentId, name, email, department, semester, contact }) => {
    const body = { studentId, name, email, department, semester, contact: contact || '' };
    const result = await apiRequest('PUT', `/students/${id}`, body);
    return {
      content: [
        {
          type: 'text',
          text: `✅ ${result.message}\n\n${JSON.stringify(result.data, null, 2)}`,
        },
      ],
    };
  }
);

// ── Tool: delete_student ──────────────────────────────────────────────────────
server.tool(
  'delete_student',
  'Delete a student record by their MongoDB _id. This is irreversible.',
  {
    id: z.string().describe('MongoDB ObjectId of the student to delete'),
  },
  async ({ id }) => {
    const result = await apiRequest('DELETE', `/students/${id}`);
    return {
      content: [{ type: 'text', text: `🗑️ ${result.message}` }],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't pollute the MCP stdio stream
  process.stderr.write('🎓 Student Management MCP Server started (stdio)\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
