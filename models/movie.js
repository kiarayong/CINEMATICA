const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title: String,
    description: String,
    genre: String,
    image: String,
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'cinemas' } 
});

module.exports = mongoose.model('movies',movieSchema);