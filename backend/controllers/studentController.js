const Student = require('../models/Student');
const mongoose = require('mongoose');

// Helper: check if ID is valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: handle duplicate key errors
const handleDuplicateError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  return `A student with ${field} "${value}" already exists.`;
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getAllStudents = async (req, res) => {
  try {
    const { search, department, semester, page = 1, limit = 100 } = req.query;

    let query = {};

    // Search by name or studentId
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
      ];
    }

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      data: students,
    });
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students.',
    });
  }
};

// @desc    Get single student by MongoDB _id
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.',
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student.',
    });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Basic required field check
    if (!studentId || !name || !email || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, name, email, department, and semester.',
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester,
      contact: contact || '',
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: student,
    });
  } catch (error) {
    console.error('createStudent error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: handleDuplicateError(error),
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating student.',
    });
  }
};

// @desc    Update student by MongoDB _id
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.',
      });
    }

    const { studentId, name, email, department, semester, contact } = req.body;

    if (!studentId || !name || !email || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, name, email, department, semester.',
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { studentId, name, email, department, semester, contact: contact || '' },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: student,
    });
  } catch (error) {
    console.error('updateStudent error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: handleDuplicateError(error),
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating student.',
    });
  }
};

// @desc    Delete student by MongoDB _id
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.',
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" deleted successfully.`,
      data: student,
    });
  } catch (error) {
    console.error('deleteStudent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student.',
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/students/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total, byDepartment, bySemester, recentCount] = await Promise.all([
      Student.countDocuments(),
      Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Student.aggregate([
        { $group: { _id: '$semester', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Student.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byDepartment,
        bySemester,
        recentCount,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats.',
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
};
