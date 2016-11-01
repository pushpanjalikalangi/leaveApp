// config/passport.js
// load all the things we need
var LocalStrategy = require('passport-local-roles').Strategy;
var bCrypt = require('bcrypt-nodejs');
// load up the user model
var User = require('../app/models/user');
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
            usernameField: 'name',
            passwordField: 'password',
            roleField: 'role',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, name, password, role, done) {
            process.nextTick(function() {
                User.findOne({
                    'local.name': name
                }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user)
                        return done(null, false);
                     else {
                        var newUser = new User();
                        newUser.local.role = role;
                        newUser.local.name = name;
                        newUser.local.password = newUser.generateHash(password); // use the generateHash function in
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
    //login
    passport.use('local-login', new LocalStrategy({
            usernameField: 'name',
            passwordField: 'password',
            roleField: 'role',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, name, password, role, done) { // callback with email and password from our form
            User.findOne({
                'local.name': name
            }, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false);
                if (!user.validPassword(password)) {
                    return done(null, false);
                } // create the loginMessage and save it to session as flashdata
                return done(null, user);
            });
        }));

    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};
