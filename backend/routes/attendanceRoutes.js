const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getAttendanceSheet,
  submitAttendance,
} = require('../controllers/attendanceController');

router.get('/subjects', getSubjects);
router.get('/sheet', getAttendanceSheet);
router.post('/submit', submitAttendance);

module.exports = router;
