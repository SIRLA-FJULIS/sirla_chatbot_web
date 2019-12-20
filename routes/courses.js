const express = require('express');
const mongoose = require('mongoose');
const model = require('../models/data');
const Course = model.Course;
const router = express.Router();
// 首頁
mongoose.connect(process.env.DB_CONNECTION,{ useUnifiedTopology: true,useNewUrlParser: true },() => {
    console.log("connect DB!")
   
  })
router.get('/', (req, res, next) => {
    Course.find((err, docs) => {

        res.render('course', {
            title: '課程管理',
            courses: docs
        });
    });
});

// 跳轉新增課程頁面
router.get('/add', (req, res, next) =>  {
    Course.find((err, docs) => {
        res.render('add', {
            title: '新增課程',
            courses: docs
        });
    });
});

// 新增課程
router.post('/add', (req, res, next) =>  {
    let courses = new Course({
        course: req.body.course,
        time: req.body.time,
        lecturer: req.body.lecturer
    });
    
    // console.log('======================create========================');

    courses.save((err, doc) => {
        // console.log(doc);
        res.redirect('/courses');
    });
    
});

// 根據id刪除對應課程資料
router.get('/del', (req, res, next) => {
    
    let id = req.query.id;

    if (id && id != '') {
        console.log('=====================delete id = ' + id);
        Course.findByIdAndRemove(id, (err, docs) => {

            res.redirect('/courses');
        });
    }
    
});

// 查詢對應修改記錄，並跳轉至修改頁面
router.get('/update', (req, res, next) => {
    
    let id = req.query.id;

    if (id && id != '') {
        Course.findById(id, (err, docs) => {
            // console.log('========================findById(\"' + id + '\")=======================\n' + docs);
            res.render('update', {
                title: '修改課程資訊',
                course: docs
            });
        });
    }
    
});

// 修改課程資料
router.post('/update', (req, res, next) =>  {
    
    let courses = {
        course: req.body.course,
        time: req.body.time,
        lecturer: req.body.lecturer
    };

    let id = req.body.id;

    if (id && id != '') {
        // console.log('=======================update id = ' + id);
        Course.findByIdAndUpdate(id, courses, (err, docs) => {
            res.redirect('/courses');
        });
    }
    
});


module.exports = router;