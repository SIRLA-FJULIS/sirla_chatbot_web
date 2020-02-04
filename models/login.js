// 登入帳號密碼
const mongoose = require('mongoose')

let loginSchema = new mongoose.Schema({          
    account:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
exports.Login = mongoose.model('login', loginSchema, 'login')