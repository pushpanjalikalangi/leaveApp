// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
// define the schema for our user model

var leaveSchema = mongoose.Schema({
        username        : String,
        leavetype       : String,
        leavefrom       : String,
        leaveto         : String,
        reason          : String,
        status          : Boolean,
        notify          : Boolean
    
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Leave', leaveSchema);
