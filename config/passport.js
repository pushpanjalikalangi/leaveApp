// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local-roles').Strategy;

// load up the user model
var User       		= require('../app/models/user');
var Leave = require('../app/models/leave');

// expose this function to our app using module.exports
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

//signup
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email

        usernameField : 'name',
        passwordField : 'password',
        roleField:'role',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password,role, done) {
        console.log(role);

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.name' :  name }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, {message:'That email is already taken.'});
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.role = role;
                newUser.local.name  = name;
                newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    }));
    //login
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'name',
        passwordField : 'password',
        roleField:'role',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password,role, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.name' :  name }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, {message: 'No user found.'}); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, {message: 'Oops! Wrong password.'}); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));
};
