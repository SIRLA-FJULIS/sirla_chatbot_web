const express = require('express');
const router = express.Router();
const model = require('../models/student');
const Student_info = model.Student;

router.get('/', (req, res) => {
    if(req.session.userName){
        Student_info.find((err, docs) => {
            // console.log(docs)
            res.render('student', {
                title: '學員簽到記錄',
                student_info: docs
            });
        });
    }else{
        req.flash('error','無法查閱學員簽到記錄，請先登入')
        res.redirect('login')
    }
});
router.get('/del', (req, res, next) => {
    if(req.session.userName){
        let id = req.query.id;
        if (id && id != '') {
            Student_info.findByIdAndRemove(id, (err, docs) => {
                res.redirect('/student');
            });
        }
    }else{
        res.redirect('/');
    }
});

router.get('/restart', (req, res, next) => {
    if(req.session.userName){
        let id = req.query.id;
        if (id && id != '') {
            Student_info.findByIdAndUpdate(id, {course: '', time: 0},(err, docs) => {
                res.redirect('/student');
            });
        }
    }else{
        res.redirect('/');
    }
});

module.exports = router;
