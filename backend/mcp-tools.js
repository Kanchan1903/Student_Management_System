/**
 * Shared MCP Tools Definition for Student Management System
 * Reused by both:
 *   - mcp-server.js (STDIO transport for Claude Desktop / local CLI)
 *   - mcp-http.js   (Streamable HTTP transport for remote Render deployment)
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require('zod');

// ─── Department enum (mirrors Mongoose schema) ────────────────────────────────
const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

/**
 * Creates and registers all 6 student management MCP tools on an McpServer instance.
 * @param {string} backendUrl Base URL of backend REST API (e.g. https://student-management-system-ytsf.onrender.com)
 * @returns {McpServer}
 */
function createStudentMcpServer(backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000')) {
  // Normalize backend URL by removing trailing slash
  const cleanBackendUrl = backendUrl.replace(/\/+$/, '');
  const apiBase = `${cleanBackendUrl}/api`;

  async function apiRequest(method, path, body = null) {
    const url = `${apiBase}${path}`;
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

  const server = new McpServer({
    name: 'student-management-mcp',
    version: '1.0.0',
  });

  // ── Tool 1: list_students ───────────────────────────────────────────────────
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

  // ── Tool 2: get_student ─────────────────────────────────────────────────────
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

  // ── Tool 3: get_stats ───────────────────────────────────────────────────────
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

  // ── Tool 4: create_student ──────────────────────────────────────────────────
  server.tool(
    'create_student',
    'Add a new student record to the database.',
    {
      studentId: z.string().describe('Unique student ID (e.g. CS2024001)'),
      name: z.string().min(2).max(100).describe('Full name of the student'),
      email: z.string().email().describe('Email address of the student'),
      department: z.enum(DEPARTMENTS).describe('Department the student belongs to'),
      semester: z.number().int().min(1).max(8).describe('Current semester (1–8)'),
      attendance: z.number().min(0).max(100).optional().describe('Attendance percentage (0–100, default 85)'),
      contact: z.string().optional().describe('Contact number (optional, 7–15 digits)'),
    },
    async ({ studentId, name, email, department, semester, attendance, contact }) => {
      const body = { studentId, name, email, department, semester };
      if (attendance !== undefined) body.attendance = attendance;
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

  // ── Tool 5: update_student ──────────────────────────────────────────────────
  server.tool(
    'update_student',
    'Update an existing student record by MongoDB _id. All fields except contact and attendance are required.',
    {
      id: z.string().describe('MongoDB ObjectId of the student to update'),
      studentId: z.string().describe('Student ID (can be the same or a new unique one)'),
      name: z.string().min(2).max(100).describe('Full name'),
      email: z.string().email().describe('Email address'),
      department: z.enum(DEPARTMENTS).describe('Department'),
      semester: z.number().int().min(1).max(8).describe('Semester (1–8)'),
      attendance: z.number().min(0).max(100).optional().describe('Attendance percentage (0–100)'),
      contact: z.string().optional().describe('Contact number (optional)'),
    },
    async ({ id, studentId, name, email, department, semester, attendance, contact }) => {
      const body = { studentId, name, email, department, semester, contact: contact || '' };
      if (attendance !== undefined) body.attendance = attendance;
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

  // ── Tool 6: delete_student ──────────────────────────────────────────────────
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

  return server;
}

module.exports = {
  createStudentMcpServer,
  DEPARTMENTS,
};
