// 課程資料
const mongoose = require('mongoose')

let courseSchema = new mongoose.Schema({          
    course:{
        type:String,
        required:true
    },
    lecturer:{
        type:String,
        required:true
    },
    date:{
        type:String
        
    },  
    check_in_number:{
        type:Number,   
    }  
});
exports.Course = mongoose.model('data' , courseSchema, 'data')