// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        name          :String,
        password     : String,
        role          : String,
        // image         :{ data: Buffer, contentType: String }

    },
    fname:String,
    lname:String,
    phonenumber:Number,
    gender:String,
    address:String,
    country:String,
    zipcode:Number,
    language:String,
    profile:Object

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
