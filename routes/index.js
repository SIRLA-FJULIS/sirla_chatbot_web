const mongoose = require('mongoose');
const format = require('date-format');
const model = require('../models/data');
const model2 = require('../models/login');
const Course = model.Course;
const Login = model2.Login;

module.exports = function (app) {
    
    // 登入頁面 
    app.get('/login', (req, res ,next) =>{
        res.render('login')
    }) 

    // // 使用者登入
    app.post('/login', (req, res)=>{
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
                req.session.userName = req.body.account; // 登入成功，設定 session
                res.redirect('/')
            }else{

                req.flash('error','帳號密碼錯誤')
                res.redirect('login')
                res.send('帳號或密碼錯誤')
            }
        })
    });
  
    // 登出
    app.get('/signout', function (req, res, next) {
       
        req.session.userName = null
        req.flash('success', '登出成功')
        res.redirect('login')
    

      })
      
    //首頁呈現當日課程
    app.get('/', (req, res, next) => {
        if(req.session.userName){
            Course.find((err, docs) => {
            let course = '無課程'
            let id = ''
            let number = ''
            let today = format('yyyy-MM-dd', new Date())
            for(let i = 0; i< docs.length; i ++){  
                if(docs[i].date == today){
                    course = docs[i].course
                    id = docs[i]._id
                    number = docs[i].check_in_number    
                } 
            }
            res.render('index', {courses:course, id:id, number:number})
            })

        }else{
            req.flash('error','無法查看首頁，請先登入')
            res.redirect('login')
            }
    })
    // 產生密碼後儲存
    app.get('/get_number', (req, res, next) => {
        let date = format('yyyy-MM-dd', new Date())
        let number = req.query.number
        Course.findOneAndUpdate({date:date}, {$set:{check_in_number:number}}, {upsert:true}, (err, docs) => {
            res.render('index')
        });
        
    })
    //路由
    app.use('/login', require('./index'));
    app.use('/student', require('./student'));
    app.use('/courses', require('./courses'));

  }