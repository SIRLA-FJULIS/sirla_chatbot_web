const mongoose = require('mongoose')

let studentSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    course:{
        type:Array,
    },
    times:{
        type:Number,
    }
})
exports.Student = mongoose.model('student_info' , studentSchema, 'student')