// 學員資訊
const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    lineid:String,
    name: String,
    course: Array,
    times: Number,
    sign_status: Boolean,
    push_status: Boolean,
});

exports.Student = mongoose.model('student_info', studentSchema, 'student');