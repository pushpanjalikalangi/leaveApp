// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
// define the schema for our user model

var postSchema = mongoose.Schema({
        companyname        : String,
        companywebsite     : String,
        companymail        : String,
        jobtype            : String,
        jobcategory        : String,
        qualification      : String,
        location           : String,
        address            : String,
        companylogo        : Object,
        apply              : Boolean


});

// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);
