var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render();
  });

router.post('/',function(req, res){
    res.send('1');;
});

module.exports = router;