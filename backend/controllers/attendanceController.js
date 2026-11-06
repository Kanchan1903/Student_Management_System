const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Predefined curriculum subjects per department and semester
const SUBJECT_MAP = {
  'Computer Science': {
    1: ['Applied Physics', 'Engineering Mathematics I', 'Programming in C', 'Basic Electrical'],
    2: ['Data Structures', 'Engineering Mathematics II', 'Digital Electronics', 'Web Technologies'],
    3: ['Object Oriented Programming (Java)', 'Database Management Systems', 'Discrete Mathematics', 'Computer Architecture'],
    4: ['Operating Systems', 'Design and Analysis of Algorithms', 'Computer Networks', 'Software Engineering'],
    5: ['Theory of Computation', 'Artificial Intelligence', 'Web Development Frameworks', 'Cyber Security'],
    6: ['Machine Learning', 'Cloud Computing', 'Compiler Design', 'Distributed Systems'],
    7: ['Deep Learning', 'Big Data Analytics', 'Internet of Things (IoT)', 'Elective I'],
    8: ['Capstone Major Project', 'Information Security', 'DevOps & CI/CD', 'Elective II'],
  },
  'Electrical Engineering': {
    1: ['Applied Physics', 'Engineering Mathematics I', 'Basic Electrical Engineering', 'Engineering Mechanics'],
    2: ['Circuit Theory', 'Engineering Mathematics II', 'Analog Electronics', 'Electrical Materials'],
    3: ['Electromagnetic Fields', 'Electrical Machines I', 'Signals and Systems', 'Digital Electronics'],
    4: ['Electrical Machines II', 'Control Systems', 'Power Systems I', 'Microprocessors & Microcontrollers'],
    5: ['Power Electronics', 'Power Systems II', 'Electrical Measurements', 'Instrumentation'],
    6: ['High Voltage Engineering', 'Switchgear & Protection', 'Renewable Energy Systems', 'Drives & Control'],
    7: ['Smart Grid Technology', 'Power Quality', 'Industrial Automation', 'Elective I'],
    8: ['Major Project', 'HVDC Transmission', 'Power System Operation', 'Elective II'],
  },
  'Mechanical Engineering': {
    1: ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Graphics', 'Basic Mechanical'],
    2: ['Engineering Mathematics II', 'Applied Chemistry', 'Workshop Practice', 'Material Science'],
    3: ['Thermodynamics', 'Strength of Materials', 'Fluid Mechanics', 'Kinematics of Machinery'],
    4: ['Applied Thermodynamics', 'Manufacturing Processes', 'Dynamics of Machinery', 'Machine Design I'],
    5: ['Heat Transfer', 'Fluid Machinery', 'Machine Design II', 'Metrology & Quality Control'],
    6: ['IC Engines & Gas Turbines', 'Refrigeration & Air Conditioning', 'CAD / CAM', 'Operations Research'],
    7: ['Automobile Engineering', 'Robotics & Automation', 'Power Plant Engineering', 'Elective I'],
    8: ['Capstone Project', 'Finite Element Analysis', 'Supply Chain Management', 'Elective II'],
  },
  'Civil Engineering': {
    1: ['Engineering Mathematics I', 'Engineering Physics', 'Basic Civil Engineering', 'Engineering Graphics'],
    2: ['Engineering Mathematics II', 'Engineering Mechanics', 'Building Materials & Construction', 'Surveying I'],
    3: ['Strength of Materials', 'Fluid Mechanics', 'Surveying II', 'Geology for Engineers'],
    4: ['Structural Analysis I', 'Concrete Technology', 'Hydrology & Water Resources', 'Soil Mechanics'],
    5: ['Structural Analysis II', 'Design of Concrete Structures', 'Geotechnical Engineering', 'Environmental Engineering I'],
    6: ['Design of Steel Structures', 'Transportation Engineering', 'Environmental Engineering II', 'Construction Management'],
    7: ['Foundation Engineering', 'Irrigation Engineering', 'Prestressed Concrete', 'Elective I'],
    8: ['Final Project', 'Earthquake Resistant Structures', 'Remote Sensing & GIS', 'Elective II'],
  },
};

// @desc    Get subjects for department and semester
// @route   GET /api/attendance/subjects
const getSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    if (department && semester && SUBJECT_MAP[department] && SUBJECT_MAP[department][semester]) {
      return res.status(200).json({
        success: true,
        subjects: SUBJECT_MAP[department][semester],
      });
    }

    res.status(200).json({
      success: true,
      subjectMap: SUBJECT_MAP,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance sheet for department, semester, subject, and date
// @route   GET /api/attendance/sheet
const getAttendanceSheet = async (req, res) => {
  try {
    const { department, semester, subject, date } = req.query;

    if (!department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Department and Semester are required.',
      });
    }

    const students = await Student.find({
      department,
      semester: parseInt(semester, 10),
    }).sort({ studentId: 1 });

    const attendanceRecords = date && subject
      ? await Attendance.find({
          department,
          semester: parseInt(semester, 10),
          subject,
          date,
        })
      : [];

    const statusMap = {};
    attendanceRecords.forEach((rec) => {
      statusMap[String(rec.student)] = rec.status;
    });

    const sheet = students.map((s) => ({
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      department: s.department,
      semester: s.semester,
      status: statusMap[String(s._id)] || 'Present', // default to Present
    }));

    res.status(200).json({
      success: true,
      count: sheet.length,
      data: sheet,
      recordedCount: attendanceRecords.length,
    });
  } catch (error) {
    console.error('getAttendanceSheet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Submit attendance records for students in a class
// @route   POST /api/attendance/submit
const submitAttendance = async (req, res) => {
  try {
    const { department, semester, subject, date, records } = req.body;

    if (!department || !semester || !subject || !date || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Department, Semester, Subject, Date, and Records array are required.',
      });
    }

    const ops = records.map((rec) => ({
      updateOne: {
        filter: {
          student: rec.studentIdMongo || rec._id,
          subject,
          date,
        },
        update: {
          $set: {
            student: rec.studentIdMongo || rec._id,
            studentId: rec.studentId,
            studentName: rec.name,
            department,
            semester: parseInt(semester, 10),
            subject,
            date,
            status: rec.status || 'Present',
          },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Attendance.bulkWrite(ops);
    }

    // Optional: Recalculate average attendance % for all affected students
    const studentIds = records.map((r) => r.studentIdMongo || r._id);
    for (const sId of studentIds) {
      const allAtts = await Attendance.find({ student: sId });
      if (allAtts.length > 0) {
        const presentCount = allAtts.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        const avg = Math.round((presentCount / allAtts.length) * 100);
        await Student.findByIdAndUpdate(sId, { attendance: avg });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students in ${subject}!`,
    });
  } catch (error) {
    console.error('submitAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubjects,
  getAttendanceSheet,
  submitAttendance,
  SUBJECT_MAP,
};
