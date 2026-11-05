const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: [
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
        ],
        message: '{VALUE} is not a valid department',
      },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    contact: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid contact number'],
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster search
studentSchema.index({ name: 'text', studentId: 'text' });

const Student = mongoose.model('Student', studentSchema, 'students');

module.exports = Student;
