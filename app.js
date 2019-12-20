const path = require('path');
const express = require('express');
const routes = require('./routes');
const env = require("dotenv/config")

const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const cors = require('cors')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

//設置ejs為模板引擎
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

//路由
routes(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))   