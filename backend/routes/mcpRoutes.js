/**
 * Web-accessible MCP Router for Remote/Render SSE Transport
 * Allows AI clients (like Antigravity, Claude, Cursor) to connect to MCP via HTTP/SSE.
 */
const express = require('express');
const router = express.Router();
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { z } = require('zod');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

// Create MCP Server instance for HTTP/SSE
const mcp = new McpServer({
  name: 'student-management-cloud-mcp',
  version: '1.0.0',
});

// Tool: list_students
mcp.tool(
  'list_students',
  'Retrieve students list with optional search query or department/semester filtering',
  {
    search: z.string().optional().describe('Search query matching name, studentId, or email'),
    department: z.enum(DEPARTMENTS).optional().describe('Filter by department'),
    semester: z.number().int().min(1).max(8).optional().describe('Filter by semester (1-8)'),
    limit: z.number().int().min(1).max(200).default(50).describe('Max students to return'),
  },
  async ({ search, department, semester, limit }) => {
    const query = {};
    if (search) {
      const reg = new RegExp(search, 'i');
      query.$or = [{ name: reg }, { studentId: reg }, { email: reg }];
    }
    if (department) query.department = department;
    if (semester) query.semester = semester;

    const students = await Student.find(query).limit(limit).sort({ createdAt: -1 });
    return {
      content: [{ type: 'text', text: JSON.stringify(students, null, 2) }],
    };
  }
);

// Tool: get_stats
mcp.tool('get_stats', 'Get overview statistics for students, departments, and semesters', {}, async () => {
  const [total, byDepartment, bySemester] = await Promise.all([
    Student.countDocuments(),
    Student.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
    Student.aggregate([{ $group: { _id: '$semester', count: { $sum: 1 } } }]),
  ]);
  return {
    content: [{ type: 'text', text: JSON.stringify({ total, byDepartment, bySemester }, null, 2) }],
  };
});

// Tool: create_student
mcp.tool(
  'create_student',
  'Add a new student record',
  {
    studentId: z.string().describe('Unique student ID (e.g. CS2024001)'),
    name: z.string().describe('Full student name'),
    email: z.string().email().describe('Email address'),
    department: z.enum(DEPARTMENTS).describe('Department'),
    semester: z.number().int().min(1).max(8).describe('Semester 1-8'),
    contact: z.string().optional().describe('Contact number'),
  },
  async ({ studentId, name, email, department, semester, contact }) => {
    const student = await Student.create({
      studentId: studentId.toUpperCase().trim(),
      name,
      email,
      department,
      semester,
      contact: contact || '',
    });
    return {
      content: [{ type: 'text', text: `✅ Student created successfully:\n${JSON.stringify(student, null, 2)}` }],
    };
  }
);

// Map of active transports per session ID
const transports = new Map();

// SSE connection endpoint for MCP clients
router.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/api/mcp/messages', res);
  transports.set(transport.sessionId, transport);

  res.on('close', () => {
    transports.delete(transport.sessionId);
  });

  await mcp.connect(transport);
});

// Message endpoint for MCP requests
router.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  if (!transport) {
    return res.status(404).json({ error: 'MCP session not found' });
  }
  await transport.handlePostMessage(req, res);
});

// Status check for MCP service
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Student Management Cloud MCP Server',
    status: 'online',
    endpoints: {
      sse: '/api/mcp/sse',
      messages: '/api/mcp/messages',
    },
    activeSessions: transports.size,
  });
});

module.exports = router;
