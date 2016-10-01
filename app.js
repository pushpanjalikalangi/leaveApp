var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var session = require('session');
var dialog = require('dialog');
var cookieparser = require('cookieparser');

var configDB = require('./config/database.js');
var flash = require('express-flash');
var multer = require('multer');


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
//	app.use(express.bodyParser()); // get information from html forms
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(multer({ dest: './uploads/' }));
	app.use('/uploads', express.static(__dirname + "/uploads"));
//	app.use(express.static('./uploads'));

	app.set('view engine', 'hbs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

// 	app.use(cookieparser('secret'));
//   app.use(session({
//     cookie: { maxAge: 60000 },
//     store: sessionStore,
//     saveUninitialized: true,
//     resave: 'true',
//     secret: 'secret'
// }));
// app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
module.exports = app;
