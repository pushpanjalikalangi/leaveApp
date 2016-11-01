var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Leave = require('../app/models/leave');
var User = require('../app/models/user');
var Post = require('../app/models/posts');
var notifier = require('node-notifier');
var multer = require('multer');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var JSAlert = require("js-alert");
var upload = multer({
    dest: 'uploads/'
});
var hbs=require('hbs');
var salt = bcrypt.genSaltSync(10);
// app/routes.js
module.exports = function(app, passport) {
//home page
app.get('/', function(req, res) {
  // res.flash('Welcome');
    res.render('index.hbs', {
        layout: 'layout1',
        // message: req.flash('signinMessage')
    });
});
//login
// app.get('/login', function(req, res) {
//
//     // render the page and pass in any flash data if it exists
//     res.render('login.hbs', {
//         message: req.flash('loginMessage')
//     });
// });
// process the login form
app.post('/', passport.authenticate('local-login', {
    successRedirect: '/role', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages)
}));
//signup
// app.get('/signup', function(req, res) {
//     // render the page and pass in any flash data if it exists
//     res.render('signup.hbs', {
//         message: req.flash('signupMessage')
//     });
// });

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/role', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

//profile
app.get('/role', isLoggedIn,function(req, res) {
    if (req.user.local.role == 'admin') {
        Leave.find({}, function(err, doc) {
            res.render('admin.hbs', {
                layout: 'layout3',
                leave: doc,
                users: req.user
            });
        })
    } else {
      res.render('userprofile.hbs', {
                   user: req.user,
                   role:'user',
                   id: req.user._id
           });
        // Leave.find({
        //     'username': req.user.local.name
        // }, function(err, doc) {
        //     if (req.user.profile) {
        //         res.render('userprofile.hbs', {
        //             leave: doc,
        //             user: req.user,
        //             //  profile:req.user.profile.img,
        //             id: req.user._id
        //         });
        //     } else {
        //         res.render('userprofile.hbs', {
        //             leave: doc,
        //             user: req.user,
        //             id: req.user._id
        //         });
        //     }
        //
        // })
    }
});

app.get('/viewleaves', isLoggedIn, function(req, res) {
    Leave.find({
        'username': req.user.local.name
    }, function(err, doc) {
        if (req.user.profile) {
            res.render('profile.hbs', {
                leave: doc,
                user: req.user,
                layout:'layout4',
                id: req.user._id
            });
        } else {
            res.render('profile.hbs', {
                leave: doc,
                user: req.user,
                layout:'layout4',
                id: req.user._id
            });
        }
    })
});
app.get('/adminupdateprofile',isLoggedIn,function(req,res) {
   res.render('updateprofile.hbs',{
        layout:'layout3',
        users:req.user
   });
});

app.get('/listofprofiles',function(req, res) {
  console.log();
    User.find({'local.role':'user'}, function(err, doc) {
        res.render('listofprofiles.hbs', {
            layout: 'layout3',
            userinfo: doc,
            users: req.user
                // profile:req.user.profile.img
        });
    });
});

app.post('/searchresults', isLoggedIn, function(req, res) {
    User.findOne({
        'local.name': req.body.search
    }, function(err, result) {
        if (result.length <= 0) {

        } else {
            res.render('listofprofiles.hbs', {
                layout: 'layout3',
                userinfo: result,
                users: req.user
            });
        }
    });
});

app.post('/removerequest', isLoggedIn, function(req, res) {
    User.remove({
        _id: req.body.id
    }, function(err, doc) {
        notifier.notify("Successfully deleted");
        res.redirect('/role');
    });
});

app.get('/view/:id',function(req,res){
  console.log(req.params.id);
  User.findOne({
    '_id':req.params.id
  },function(err,doc){
    // console.log(doc);
    res.render("userprofile.hbs",{
      layout:'layout3',
      users:req.user,
       user:doc
    });
  })

});


app.get('/post', isLoggedIn, function(req, res) {
    res.render('posts.hbs', {
        layout: 'layout3',
        users: req.user

    })
});
app.post('/authentication', function(req, res) {
    //  res.send(req.body.id);
    User.update({
            _id: req.body.id
        }, {
            $set: {
                auth: true
            }
        },
        function(err, result) {
            if (err)
                res.json(err)
            else
                notifier.notify("Accepted");
            res.redirect('/role');

        });
});
app.get('/viewtutorials',isLoggedIn,function(req,res){
      res.render('tutorials.hbs',{
        user:req.user
      });
});
app.get('/settings',isLoggedIn,function(req,res){
  res.flash('hello');
      res.render('settings.hbs',{
        layout:'layout4',
        user:req.user
      });
});
app.get('/forgotpassword',isLoggedIn,function(req,res){
  res.render('forgotpassword.hbs',{
    user:req.user
  });
});
app.get('/resetpassword',isLoggedIn,function(req,res){
  res.render('resetpassword.hbs',{
    user:req.user
  });
});
app.post('/reset',isLoggedIn,function(req,res){
  n = bcrypt.hashSync(req.body.password,salt);
    User.update({_id: req.body.id}, {
        $set: {
            'local.password':n
          }
      },
      function(err, result) {
          if (err)
              res.json(err)
          else
          {
              notifier.notify("Successfully Changed");
          }
      });
});
app.post('/deleteaccount',isLoggedIn,function(req,res) {
  console.log(req.body);
   username = req.body.username;
    password = req.body.password;
    newpwd = req.user.local.password;
    if(username == req.user.local.name){
      bcrypt.compare(password, newpwd, function(err, result) {
        console.log(result);
        if(result == true){
            User.remove({'local.name':req.body.username},function(err,doc) {
              if(err)
               res.json(err);
               else
                res.flash('Successfully Changed','success');
            });
    }
    else {
    // res.flash('Inavalid username and Password','error');
  
    }
  });
  }
});

app.post('/sendmail',isLoggedIn,function(req,res){
  console.log(req.body.mail);
  var transporter = nodemailer.createTransport({service: 'Gmail',
        auth: {
            user: 'pushpa.k@bestflux.com', // Your email id
            pass: 'pushpanjali' // Your password
        }
      });
    var mailOptions = {
    from: '<pushpa.k@bestflux.com>', // sender address
    to: req.body.mail, // list of receivers
    subject: 'Reset Your Password ✔', // Subject line
    text: 'You can use the following link to reset your password:', // plaintext body
    html: '<a href="http://localhost:3000/resetpassword">forgotpassword</a>' // html body
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    res.redirect('/role');
    console.log('Message sent: ' + info.response);
});
})
app.post('/changeusername',isLoggedIn,function(req,res){
    User.update({_id: req.body.id}, {
        $set: {
            'local.name':req.body.username
          }
      },
      function(err, result) {
          if (err)
              res.json(err)
          else
          {
              notifier.notify("Successfully Changed");
               res.redirect('/settings');
          }
      });
})
app.post('/changingpassword',isLoggedIn,function(req,res){
  oldpwd = req.body.old;
  newpwd = req.user.local.password;
  n = bcrypt.hashSync(req.body.password,salt);
  bcrypt.compare(oldpwd, newpwd, function(err, result) {
    console.log(result);
    if(result == true ){
    User.update({_id: req.body.id}, {
        $set: {
            'local.password':n
          }
      },
      function(err, result) {
          if (err)
              res.json(err)
          else
          {
              notifier.notify("Successfully Changed");
               res.redirect('/settings');
          }
      });
    }
    else {
      notifier.notify("unable to update your password,please check your password");
    //  alert("unable");
    }
});
})

app.post('/changingname',isLoggedIn,function(req,res){
  console.log(req.body);
    User.update({_id: req.body.id}, {
      $set: {
          'fname':req.body.fname,
          'lname':req.body.lname
        }
    },
    function(err, result) {
        if (err)
            res.json(err)
        else
        {
            notifier.notify("Successfully Changed your name");
            res.redirect('/settings');
        }
    });

})

app.get('/viewangulartutorials',isLoggedIn,function(req,res){
      res.render('angular.hbs',{
        user:req.user
      });
});
app.post('/newpost', isLoggedIn, upload.single('clogo'), function(req, res, next) {
    var post = new Post({
        companyname: req.body.companyname,
        companywebsite: req.body.companywebsite,
        companymail: req.body.companymail,
        jobtype: req.body.jobtype,
        jobcategory: req.body.category,
        qualification: req.body.qualification,
        location: req.body.clocation,
        address: req.body.caddress,
        companylogo: {
            name: req.file.originalname,
            img: req.file.path,
            contentType: req.file.mimetype
        },
        apply: false
    });
    post.save(function(err, doc) {
        if (err)
            res.json(err);
        else {
            notifier.notify('You Have Posted Successfully');
            res.redirect('/role');
        }
    });
});
app.post('/deleteleave/:id', isLoggedIn, function(req, res) {
    // console.log(req.params.id);
    Leave.remove({
        _id: req.params.id
    }, function(err, doc) {
        notifier.notify("Successfully deleted");
        res.redirect('/role');
    });
});

app.get('/viewpost', isLoggedIn, function(req, res) {
    // console.log(req.user);
    Post.find({}, function(err, doc) {
        res.render('viewjobs.hbs', {
            post: doc,
            user: req.user
                //profile:req.user.profile.img
        });
    });
});

app.post('/applypost', function(req, res) {
    //  res.send(req.body.id);
    Post.update({
            _id: req.body.id
        }, {
            $set: {
                apply: true
            }
        },
        function(err, result) {
            if (err)
                res.json(err)
            else
                notifier.notify("Successfully Applied");
            res.redirect('/role');

        });
})

app.get('/update', function(req, res) {
    User.findOne({
        _id: req.user._id
    }, function(err, doc) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.render('updateprofile.hbs', {
                user: req.user
                    //  profile:req.user.profile.img
            });
        }
    });
});

app.post('/updateprofile', isLoggedIn, upload.single('profile'), function(req, res, next) {

    User.update({
            _id: req.body.id
        }, {
            $set: {
                'name': req.user.local.name,
                'fname': req.body.fname,
                'lname': req.body.lname,
                'email': req.body.email,
                'phonenumber': req.body.pno,
                'gender': req.body.gender,
                'address': req.body.address,
                'country': req.body.country,
                'zipcode': req.body.zipcode,
                'language': req.body.language,
                'auth':false,
                'profile': {
                    name: req.file.originalname,
                    img: req.file.path,
                    contentType: req.file.mimetype
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


app.get('/applyleave', isLoggedIn, function(req, res) {
    res.render('applyleave', {
        user: req.user
            //  profile:req.user.profile.img
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
