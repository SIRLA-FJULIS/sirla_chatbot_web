const mongoose = require('mongoose');
const model = require('../models/data');
const format = require('date-format');
const Course = model.Course;

module.exports = function (app) {
        
    app.get('/', (req, res, next) => {
        //首頁呈現當日課程
        Course.find((err, docs) => {
        let course = '無課程'
        let id = ''
        let number = ''
        let today = format('yyyy-MM-dd', new Date())
        for(let i = 0; i< docs.length; i ++){  
            if(docs[i].date == today){
                course = docs[i].course
                id = docs[i]._id
               
            } 
        }
        res.render('index', {courses:course, id:id})
        })
    })
    app.get('/get_number', (req, res, next) => {
        let date = format('yyyy-MM-dd', new Date())
        let number = req.query.number
        Course.findOneAndUpdate({date:date}, {$set:{check_in_number:number}}, {upsert:true}, (err, docs) => {
            res.redirect('/courses');
        });

    
        
    })

    app.use('/login', require('./login'));
    app.use('/student', require('./student'));
    app.use('/courses', require('./courses'));

  }