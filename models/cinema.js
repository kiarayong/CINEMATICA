const mongoose = require('mongoose');

const cinemaSchema = mongoose.Schema({
    name: String,
    location: String
});

module.exports = mongoose.model('cinemas',cinemaSchema);