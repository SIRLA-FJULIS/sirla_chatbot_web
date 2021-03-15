// 管理員資訊
const mongoose = require('mongoose');

let adminSchema = new mongoose.Schema({
    lineid:String,
    name: String,
});

exports.Admin = mongoose.model('admin_info', adminSchema, 'admin');