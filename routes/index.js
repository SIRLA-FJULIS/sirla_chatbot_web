const mongoose = require('mongoose');
const format = require('date-format');
const model = require('../models/data');
const model2 = require('../models/login');
const Course = model.Course;
const Login = model2.Login;

module.exports = function (app) {
    // 登入頁
    app.get('/', (req, res ,next) =>{
        res.redirect('login')
    })
    app.get('/login',(req, res ,next) =>{
        res.render('login')
    }) 
    app.post('/login', (req, res) => {
        let postData = {
            account: req.body.account,
            password: req.body.password
        };
        Login.findOne({
            account: postData.account,
            password: postData.password
        }, (err, data) => {
            if(err) throw err;
            if(data){
                
                res.redirect('number')
            }else{
                res.send('账号或密码错误')
            }
        
        })
    })
    
    app.get('/number', (req, res, next) => {
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
    // 產生密碼後儲存
    app.get('/get_number', (req, res, next) => {
        let date = format('yyyy-MM-dd', new Date())
        let number = req.query.number
        Course.findOneAndUpdate({date:date}, {$set:{check_in_number:number}}, {upsert:true}, (err, docs) => {
            res.redirect('/courses');
        });
        
    })
    //路由
    app.use('/login', require('./index'));
    app.use('/number', require('./index'));
    app.use('/student', require('./student'));
    app.use('/courses', require('./courses'));

  }