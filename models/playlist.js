const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    name: String,
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies' }],
});

module.exports = mongoose.model('playlists', playlistSchema);
