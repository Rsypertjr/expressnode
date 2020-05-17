var express = require('express');
var router = express.Router();

router.get('/', function(req,res){
    res.send('GET route on things.\n');
});

router.post('/', function(req,res){
    res.send('POST route on things.\n');
});

router.get('/:name/:id', function(req,res){
    res.send('id: ' + req.params.id + ' and name: ' + req.params.name + '\n');
});

router.get('/:id([0-9]{5})', function(req, res){
    res.send('id: ' + req.params.id + '\n');
});

//export this router to use in our index.js
module.exports = router;