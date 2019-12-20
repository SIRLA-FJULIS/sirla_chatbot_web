const express = require('express');
const router = express.Router();
const model = require('../models/student');
const Student_info = model.Student;




router.get('/', (req, res) => {
    Student_info.find((err, docs) => {
        console.log(docs)
        res.render('student', {
            title: '學員簽到記錄',
            student_info: docs
        });
    });
});


module.exports = router;
