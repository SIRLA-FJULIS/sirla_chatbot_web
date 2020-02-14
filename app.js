require('dotenv').config();
var ObjectID = require('mongodb').ObjectID;

const path = require('path');
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const format = require('date-format');

// 登入登出驗證
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');


const line = require('@line/bot-sdk');
const config = {
    channelId: process.env['channelId'],
    channelSecret: process.env['CHANNEL_SECRET'],
    channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN']
};

const app = express();
const port = process.env.PORT || 3000;


app.post('/linewebhook', line.middleware(config), (req, res) => {
	if(req.body.events[0].type == 'follow'){
	    Promise.all(req.body.events.map(followEvent)).then((result) => {
	        res.json(result);
	    }).catch((error) => {
	        return false;
	    });
	}else{
	    Promise.all(req.body.events.map(handleEvent)).then((result) => {
	        res.json(result);
	    }).catch((error) => {
	        return false;
	    });
	}
});

const client = new line.Client(config);
const model = require('./models/student');
const model_class = require('./models/data')
const Student = model.Student;
const Class = model_class.Course

function followEvent(event) {
    let userid = event.source.userId;
    let user_name = '';

    client.getProfile(userid).then((profile) => {
        user_name = profile.displayName;
        let studentData = new Student({
		    lineid: userid, 
		    name: user_name,
		    times : 0,
		    sign_status: true
		});

	    studentData.save((err, Student) => {
	        if (err) {
	            return handleError(err);
	        }
	        console.log('document saved');
	    });

    }).catch((err) => {
        // error handling
    });
}

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    let userid = event.source.userId;
    let user_name = '';
    let today_format = format('yyyy-MM-dd', new Date());

    // 取得學員名稱
    client.getProfile(userid).then((profile) => {
        user_name = profile.displayName;
        // console.log(profile.userId);
        // console.log(profile.pictureUrl);
        // console.log(profile.statusMessage);
    }).catch((err) => {
        // error handling
    });
    // 設定管理員推播訊息給全部人
    if(userid === 'U3ceeee6cbac7479603b5a7094068f420' && event.message.text.slice(0,2) == "推送"){
        let msg = {
            type: 'text',
            text: event.message.text.slice(2)
        }
        // 被推播者
        Student.find((err, student_docs) =>{
            for (let k = 0; k < student_docs.length; k++){
                client.pushMessage(student_docs[k].lineid, msg).then(() =>{
                    //...
                }).catch((err)=>{
                    console.log(err);
                });               
            }
        })
    }else if (event.message.text === '簽到') {
        let today = new Date();
        let now_time = [];
        let distance = []; //存放每堂課程離今天差幾天用
        let hava_class = false; //判斷今日是否有課程
        let found = false; //判斷是否資料庫內有這名學生
        reply = "";
        now_time.push(today.getFullYear(), today.getMonth()+1, today.getDate());

        Class.find((err,docs) => {
            // 計算時間差
            for(let i = 0; i <docs.length; i++){
                //console.log(docs[i].date);
                class_time = docs[i].date.split("-");
                let step = (class_time[0] - now_time[0])*365 + (class_time[1] - now_time[1])*30 + (class_time[2] - now_time[2]);

                distance.push(step);
            }

            for(let j = 0; j <distance.length; j++){
                // 如果今日有課(時間差為0
                if (distance[j] == 0){
                    hava_class = true;

                    Student.findOneAndUpdate({lineid: userid}, {$set:{sign_status: false}}, (err, ct)=>{
                        console.log(err);
                    });
                    
                    Student.find((err,student_docs) =>{
                        // console.log(student_docs)
                        // 確認是否經有這名學生的資料
                        Student.findOne({ lineid: userid },(err, adventure)=> {
                            if (adventure != null){
                                if (adventure.course.indexOf(docs[j].course) != -1){
                                    return client.replyMessage(event.replyToken,{
                                        type: 'text',
                                        text: "已經簽到"
                                    });                                      
                                }else{
                                    Student.findOneAndUpdate({lineid: userid}, {$set:{sign_status: true}}, (err, dos)=>{
                                        return client.replyMessage(event.replyToken,{
                                            type: 'text',
                                            text: "請輸入密碼"     
                                        });                                           
                                    })
                                }                 
                            }
                        });
                    })
                }  
            }

            if(hava_class == false){
                return client.replyMessage(event.replyToken,{
                    type: 'text',
                    text: "今日無課程"
                });
            }
        });

    }else if(/\d+/.test(event.message.text) === true ){
        Student.findOne({ lineid: userid }, (err, status) =>{
            Class.findOne({date: today_format}, (err, class_docs) =>{
                if(status.sign_status === true && event.message.text == class_docs.check_in_number){
                    status.course.push(class_docs.course);
                    //console.log(adventure.course)
                    //寫入簽到次數與課程
                    Student.findOneAndUpdate({lineid: userid}, {$set:{times: status.times + 1, course: status.course, sign_status: false}}, (err, ct)=>{
                        console.log(err)
                    });
                    return client.replyMessage(event.replyToken,{
                        type: 'text',
                        text: "簽到完成"
                    });
                }else if(status.sign_status === true){
                    Student.findOneAndUpdate({lineid: userid}, {$set:{sign_status: false}}, (err, ct)=>{
                        console.log(err)
                    });
                    return client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: "密碼錯誤"
                    });
                }else{
                    return client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: "查無此關鍵字，請重新輸入"
                    });                
                }                
            })
        });
    }else if(event.message.text === '最新課程'){
        let today=new Date();
        let now_time = [];
        let distance = [];
        now_time.push(today.getFullYear(), today.getMonth()+1, today.getDate());

        Class.find((err,docs) => {
            for(let i = 0; i <docs.length; i++){
                console.log(docs[i].date);
                class_time = docs[i].date.split("-");
                let step = (class_time[0] - now_time[0])*365 + (class_time[1] - now_time[1])*30 + (class_time[2] - now_time[2]);
                distance.push(step);
            }
            console.log(distance);
            let k = 999; //看最小值用
            for(let j = 0; j <distance.length; j++){
                if (distance[j] >= 0 && distance[j] < k){
                    k = distance[j];
                }
            }
            let c = distance.indexOf(k);

            if(c == -1){
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: "目前沒有課程"
                });
          
            }else{
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: [" 課程名稱：", docs[c].course + '\n', "日期：", docs[c].date + '\n', "講者：", docs[c].lecturer].join(" ")
                });
            }
        })
    }else if(event.message.text === '出席率查詢'){

        Student.findOne({ lineid: userid }, (err, time_docs) =>{
            if (time_docs != null){
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '本學期已完成' + time_docs.times + '次簽到'
                });
            }else{
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '尚無資料'
                });
            }
         });

    }else if(event.message.text === '幫助' || event.message.text === 'help'){
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: "請使用關鍵字：簽到、課程、出席率查詢"
        });
    }else{
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: "查無此關鍵字，請重新輸入"
        });
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
//設置ejs為模板引擎
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//session
app.use(session({
    secret: process.env['SESSION_SECRET'], 
    resave: true,
    saveUninitialized: false, // 是否儲存未初始化的會話
    cookie: { maxAge: 60 * 1000 }
  }));
  app.use(flash());
  app.use((req, res, next) =>{
    res.locals.errors = req.flash('error')
    res.locals.success = req.flash('success')
    next()
  });

//路由
routes(app);
//資料庫連結
mongoose.connect(
    process.env['DB_CONNECTION'], { 
        useUnifiedTopology: true,useNewUrlParser: true 
    }, () => {
        console.log("connect DB!");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// https://sirla-chatbot.herokuapp.com