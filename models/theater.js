const mongoose = require('mongoose');

const theaterSchema = mongoose.Schema({
    name: {type: String, unique: true},
    address: String,
    city:String,
    phone:Number,
    email:String,

});

module.exports = mongoose.model('theaters',theaterSchema);