require('dotenv').config();
var ObjectID = require('mongodb').ObjectID;

const path = require('path');
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const line = require('@line/bot-sdk');
const config = {
  //channelId: process.env['channelId'],
  channelSecret: process.env['CHANNEL_SECRET'],
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN']
};

const app = express();
const port = 3000;

app.post('/linewebhook', line.middleware(config), (req, res) => {
  
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      res.json(result);
      //console.log(req.body.events);
    });
});

const client = new line.Client(config);
const model = require('./models/student');
const model_class = require('./models/data')
const Student = model.Student;
const Class = model_class.Course



function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  // 將下面重複用到的變數提上來
  var userid = event.source.userId;
  var user_name = ''
  
  // 取得使用者名稱
  client.getProfile(userid)
  .then((profile) => {
    user_name = profile.displayName;
    // console.log(profile.userId);
    // console.log(profile.pictureUrl);
    // console.log(profile.statusMessage);
    //console.log('user_name',user_name)
  })
  .catch((err) => {
    // error handling
  });

  if (event.message.text === '簽到') {
    let today = new Date();
    let now_time = [];
    let distance = []; //存放每堂課程離今天差幾天用
    var hava_class = false; //判斷今日是否有課程
    var sign = false; //判斷是否遷到過

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
        
          Student.find((err,student_docs) =>{
            var found = false; //判斷是否資料庫內有這名學生
            
            for(let k = 0; k < student_docs.length; k++){
              // 如果有這名學生
              if (user_name === student_docs[k].name){
                found = true;
                let re1 = new RegExp('w*' + docs[j].course + 'w*'); //判斷這堂課是否已在被簽到的紀錄內

                if(re1.test(student_docs[k].course)){
                  sign = true;
                  break
                }
                
                let sign_class = student_docs[k].course + '，' + docs[j].course;
                //寫入簽到次數
                Student.findOneAndUpdate({'name' : user_name}, {$set:{'times': student_docs[k].times + 1}});

                //寫入簽到的課程
                Student.findOneAndUpdate({'name' : user_name}, {$set:{'course': sign_class}});
              }
            }

            if(hava_class === true && sign === false){
              if(!found){
                let studentData = new Student({
                name: user_name,
                course: docs[j].course,
                times : 1
                });
                studentData.save((err, Student) => {
                if (err) {
                  return handleError(err);
                }
                console.log('document saved');
                });
              }

              return client.replyMessage(event.replyToken,{
                  type: 'text',
                  text: "簽到完成"
                });

            }else if(hava_class === true){
              return client.replyMessage(event.replyToken,{
                  type: 'text',
                  text: "已經簽到"
                });     
            }
          })
        }  
      }
      if(hava_class == false){
        return client.replyMessage(event.replyToken,{
          type: 'text',
          text: "今日無課程"
        });
      }
    })

  }else if(event.message.text === '課程'){
    reply = "";
    let today = new Date();
    let now_time = [];
    let distance = [];
    now_time.push(today.getFullYear(), today.getMonth()+1, today.getDate());

    Class.find((err,docs) => {
      for(let i = 0; i <docs.length; i++){
        //.log(docs[i].date);
        class_time = docs[i].date.split("-");
        let step = (class_time[0] - now_time[0])*365 + (class_time[1] - now_time[1])*30 + (class_time[2] - now_time[2]);
        distance.push(step);
      }
     // console.log(distance);
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
    let times = ''
    Student.find((err, docs) =>{
      for (i in docs){
        if(userid == docs[i].name){
          times = docs[i].times ;
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '本學期已完成' + times + '次簽到'
            });
          }
      }
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '尚無資料'
        });
    })
  }else if(event.message.text === '幫助' || event.message.text === 'help'){
    reply = "請使用關鍵字：簽到、課程、出席率查詢";
  }else{
    reply = "查無此關鍵字，請重新輸入";
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
  }

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

//設置ejs為模板引擎
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

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