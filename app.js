require('dotenv').config();

const path = require('path');
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const line = require('@line/bot-sdk');
const config = {
  //channelId: process.env['channelId'],
  channelSecret: process.env['channelSecret'],
  channelAccessToken: process.env['channelAccessToken']
};

const app = express();
const port = 3000;

app.post('/linewebhook', line.middleware(config), (req, res) => {
  
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
    	res.json(result);
    	console.log(req.body.events);
    });
});

const client = new line.Client(config);
const Student = require('./models/student');
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  if (event.message.text === '簽到') {
  	let userid = event.source.userId;
  	let studentData = new Student({
	  	name: userid,
	    course: event.source.type,
	    times : Date.now()
	  });
  	studentData.save((err, Student) => {
		  if (err) {
		  	return handleError(err);
		  }
		  console.log('document saved');
	});
  	return client.replyMessage(event.replyToken, {
	    type: 'text',
	    text: "簽到完成！"
	});
  }
};

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