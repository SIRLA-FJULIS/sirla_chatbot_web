const express = require('express');
const router = express.Router();

let student = {

    title: 'student',
    info: [
        {name:'Super',times:'5'}, 
        {name:'Su',times:'4'}, 
        {name:'Superman',times:'10'}]
  } 


router.get('/', function(req, res) {
    res.render('student.ejs', student);
});


module.exports = router;
