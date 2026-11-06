require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const mcpRoutes = require('./routes/mcpRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB Atlas ───────────────────────────────────────────────
connectDB();

// ─── CORS Configuration ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://frontend-426d.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      // Allow exact matches or any vercel.app preview domain for this project
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (development) ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mcp', mcpRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
