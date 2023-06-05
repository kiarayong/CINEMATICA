const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title: {type: String, unique: true},
    description: String,
    genre:String,
    release: {
        date: String,
    },
    duration:Number,
    director:String,
    rating:Number,
});

module.exports = mongoose.model('movies',movieSchema);