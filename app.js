require('dotenv').config();
var ObjectID = require('mongodb').ObjectID;

const path = require('path');
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

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
const port = 3000;


app.post('/linewebhook', line.middleware(config), (req, res) => {
 
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      res.json(result);

    })
    .catch((error) => {
      // error 
      return false;
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
  let userid = event.source.userId;
  let user_name = ''
  // 取得學員名稱
  client.getProfile(userid)
  .then((profile) => {
    user_name = profile.displayName;
    // console.log(profile.userId);
    // console.log(profile.pictureUrl);
    // console.log(profile.statusMessage);
  })
  .catch((err) => {
    // error handling
  });

  if (event.message.text === '簽到') {
    let today = new Date();
    let now_time = [];
    let distance = []; //存放每堂課程離今天差幾天用
    let hava_class = false; //判斷今日是否有課程
    let sign = false; //判斷是否遷到過
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

            Student.find((err,student_docs) =>{
                // console.log(student_docs)
              
                Student.findOne({ lineid: userid },(err, adventure)=> {
                  console.log(found,"1號")
                  console.log(userid)
                  if (adventure != null){
                    console.log(adventure)
                    console.log(docs[j].course)
                    
                    // if(user_name != adventure.name){
                    //     Student.findOneAndUpdate({'name' : adventure.name}, {$set:{'name': user_name}});
                    // }

                    if (adventure.course.indexOf(docs[j].course) != -1){
                        sign = true;
                        return client.replyMessage(event.replyToken,{
                          type: 'text',
                          text: "已經簽到"
                        });                                      
                    }else{
                            adventure.course.push(docs[j].course);
                            //console.log(adventure.course)
                            //寫入簽到次數與課程
                            Student.findOneAndUpdate({lineid: userid}, {$set:{times: adventure.times + 1, course: adventure.course}}, (err, ct)=>{
                                console.log(err)
                            });

                            return client.replyMessage(event.replyToken,{
                              type: 'text',
                              text: "簽到完成"     
                            });           
                        }                 
                  }else{
                      console.log(found,"2號");
                      if(!found){
                          let studentData = new Student({
                              lineid: userid, 
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
                          return client.replyMessage(event.replyToken,{
                            type: 'text',
                            text: "簽到完成"     
                          });   
                      }
                  }
                })
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
    // ！！！！！！！！！！！！！！！！！！！！！！！！！！！！
    
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
// ！！！！！！！！！！！！！！！！！

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