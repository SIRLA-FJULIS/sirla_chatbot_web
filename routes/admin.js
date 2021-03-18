const express = require('express');
const router = express.Router();
const model = require('../models/admin');
const Admin_info = model.Admin;

router.get('/', (req, res) => {
    if(req.session.userName){
        Admin_info.find((err, docs) => {
            //console.log(docs)
            res.render('admin', {
                title: '管理員列表',
                admin_info: docs
            });
        });
    }else{
        req.flash('error','無法查閱管理員列表，請先登入')
        res.redirect('login')
    }
});

// 新增課程
router.post('/add', (req, res, next) =>  {
    if(req.session.userName){
        let courses = new Course({
            course: req.body.course,
            date: req.body.date,
            lecturer: req.body.lecturer,
            teaching_material:req.body.material
        });
        courses.save((err, doc) => {
            res.redirect('/courses');
        });
    }else{
        res.redirect('/');
    }
    
});

router.get('/del', (req, res, next) => {
    if(req.session.userName){
        let id = req.query.id;
        if (id && id != '') {
            Admin_info.findByIdAndRemove(id, (err, docs) => {
                res.redirect('/admin');
            });
        }
    }else{
        res.redirect('/');
    }
});

module.exports = router;
