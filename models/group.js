// 群組資訊
const mongoose = require('mongoose');

let groupSchema = new mongoose.Schema({
    groupid:String,
});

exports.Group = mongoose.model('group_info', groupSchema, 'group');