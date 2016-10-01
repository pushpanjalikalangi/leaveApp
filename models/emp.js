
var mongoose = require('mongoose');
var Schema =mongoose.Schema;
var emp=new Schema({
  _id:String,
  name:String,
  age:Number
});
mongoose.connect('mongodb://localhost/Company');

module.exports = mongoose.model('user',emp);
  
