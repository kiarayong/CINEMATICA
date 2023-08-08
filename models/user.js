const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'playlists' }], // Reference the 'Playlist' model
    token: String,
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('users', userSchema); // Use 'User' as the model name
