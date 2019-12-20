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
});
exports.Course = mongoose.model('data' , courseSchema, 'data')