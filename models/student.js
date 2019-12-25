const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    name: String,
    course: Array,
    times: Number,
});

module.exports = mongoose.model('student_info', studentSchema, 'student');