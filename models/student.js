// 學員資訊
const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    lineid:String,
    name: String,
    course: Array,
    times: Number,
});

exports.Student = mongoose.model('student_info', studentSchema, 'student');