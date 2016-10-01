var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Leave = require('../app/models/leave');
var User = require('../app/models/user');
var notifier = require('node-notifier');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
// app/routes.js
module.exports = function(app, passport) {
    //home page
    app.get('/', function(req, res) {
        res.render('index.hbs'); // load the index.ejs file
    });
    // app.post('/upload', upload.single('profile'), function (req, res, next) {
    //   // req.file is the `avatar` file
    //   // req.body will hold the text fields, if there were any
    //   res.send(req.file.path);
    // });

    //login
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.hbs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/role', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    //signup
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.hbs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/role', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    //profile
    app.get('/role', function(req, res) {
        if (req.user.local.role == 'admin') {
            Leave.find({}, function(err, doc) {
                res.render('admin.hbs', {
                    leave: doc,
                    user: req.user.local.name
                });
            })
        } else {
            Leave.find({
                'username': req.user.local.name
            }, function(err, doc) {
              if (req.user.profile) {
                res.render('profile.hbs', {
                    leave: doc,
                    user: req.user.local.name,
                    profile:req.user.profile.img,
                    id:req.user._id
                });
              } else {
                res.render('profile.hbs', {
                    leave: doc,
                    user: req.user.local.name,
                    id:req.user._id
                });
              }

            })
        }
    });

    app.get('/update', function(req, res) {
      User.findOne({_id:req.user._id},function(err,doc){
        if (err) {
          res.json({err:err})
        } else {
          res.render('updateprofile.hbs',{
            user:doc
          });
        }
      });
  });

    app.post('/updateprofile',isLoggedIn,upload.single('profile'),function(req, res,next) {
    console.log(req.file.originalname);
        User.update({
                _id: req.body.id
            }, {
                $set: {
                    'name':  req.user.local.name,
                    'fname':req.body.fname,
                    'lname':req.body.lname,
                    'phonenumber':req.body.pno,
                    'gender':req.body.gender,
                    'address':req.body.address,
                    'country':req.body.country,
                    'zipcode':req.body.zipcode,
                    'language':req.body.language,
                    'profile':{
                      name:req.file.originalname,
                      img:req.file.path,
                      contentType:req.file.mimetype
                    }

                }
            },
            function(err, result) {
                if (err)
                    res.json(err)
                else
                    notifier.notify("profile is Successfully updated");
                    res.redirect('/role');

            });
    })


    app.get('/applyleave',isLoggedIn, function(req, res) {
        res.render('applyleave',{
          name:req.user.local.name
        });
    });

    app.post('/applynewleave', isLoggedIn, function(req, res) {
        var leave = new Leave({
            username: req.user.local.name,
            leavetype: req.body.leavetype,
            leavefrom: req.body.leavefrom,
            leaveto: req.body.leaveto,
            reason: req.body.reason,
            status: false,
            notify: false
        });
        leave.save(function(err, doc) {
            if (err)
                res.json(err);
            else {
                notifier.notify('You Have Applied Successfully');
                res.redirect('/role');
                //  Leave.find({'username':req.user.local.name},function(err,doc){
                //       res.render('profile.hbs', {leave : doc});
                //  })
            }
        });
    });

    app.post('/approve/:id', function(req, res) {
        Leave.update({
                _id: req.params.id
            }, {
                $set: {
                    'status': true,
                    'notify': true
                }
            },
            function(err, result) {
                if (err)
                    res.json(err)
                else
                    res.redirect('/role');

            });
    })
		//reject
		app.post('/reject/:id', function(req, res) {
        Leave.update({
                _id: req.params.id
            }, {
                $set: {
                    'status': false,
                    'notify': true
                }
            },
            function(err, result) {
                if (err)
                    res.json(err)
                else
                    res.redirect('/role');

            });
    })


    //logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
