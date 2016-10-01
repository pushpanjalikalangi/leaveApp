var express = require('express');
var router=express.Router();
var mongoose = require('mongoose');
require('../models/emp');
var user = mongoose.model('user');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', upload.any(), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.send(req.files);
});
router.get('/view',function(req,res) {
  user.find({},function(err,docs){
    if(err)
      res.json(err);
    else
      res.render('view',{users:docs});
  });
});

router.post('/new',function(req,res) {
  new user({
    _id:req.body.email,
     name:req.body.name,
    age:req.body.age
  }).save(function(err,doc){
    if(err)res.json(err);
    else
    {
      console.log(user);
      res.json("inserted");
    }
    });
});

module.exports = router;
