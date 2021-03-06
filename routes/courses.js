const express = require('express');
const mongoose = require('mongoose');
const model = require('../models/data');
const Course = model.Course;
const router = express.Router();


// 課程首頁

router.get('/', (req, res, next) => {
    if(req.session.userName){
        Course.find((err, docs) => {
            //排序
            let sortcourse = docs.sort((a,b) =>{
                return a.date < b.date ? -1 : 1;
            });
            res.render('course', {
                title: '課程管理',
                courses: sortcourse,
            });
            
        });
    }else{
        req.flash('error','無法查看課程，請先登入')
        res.redirect('login');
    }
});

// 跳轉新增課程頁面
router.get('/add', (req, res, next) =>  {
    if(req.session.userName){
        Course.find((err, docs) => {
            res.render('add', {
                title: '新增課程',
                courses: docs
            });
        });
    }else{
        res.redirect('/courses');
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

// 根據id刪除對應課程資料
router.get('/del', (req, res, next) => {
    if(req.session.userName){
        let id = req.query.id;
        if (id && id != '') {
            Course.findByIdAndRemove(id, (err, docs) => {
                res.redirect('/courses');
            });
        }
    }else{
        res.redirect('/');
    }
    
});

// 查詢對應修改記錄，並跳轉至修改頁面
router.get('/update', (req, res, next) => {
    if(req.session.userName){
        let id = req.query.id;
        if (id && id != '') {
            Course.findById(id, (err, docs) => {
                res.render('update', {
                    title: '修改課程資訊',
                    course: docs
                });
            });
        }
    }else{
        res.redirect('/courses');
    }
    
    
});

// 修改課程資料
router.post('/update', (req, res, next) =>  {
    if(req.session.userName){
        let courses = {
            course: req.body.course,
            date: req.body.date,
            lecturer: req.body.lecturer,
            teaching_material:req.body.teaching_material
        };

        let id = req.body.id;

        if (id && id != '') {
            Course.findByIdAndUpdate(id, courses, (err, docs) => {
                res.redirect('/courses');
            });
        }
    }else{
        res.redirect('/');
    }
    
});

module.exports = router;