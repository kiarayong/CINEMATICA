const mongoose = require('mongoose');
const movie = require("../models/movie.js");
const user = require('../models/user.js');
const cinema = require("../models/cinema.js"); // Add this line
const playlist = require('../models/playlist.js');
const e = require('express');

let db={
    async connect() {
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/Cinematica');
            return "Connected to Mongo DB";
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error connecting to Mongo DB");
        }
    },
    async getAllMovies() {
        try {
            let results = await movie.find().populate('cinema',['name','location']);
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving movies");
        }
    },
    async getAllCinemas() {
        try {
            let results = await cinema.find();
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving movies");
        }
    },
    async  addMovie(title, description, genre, image, cinemaId, userId) {
        try {
            // Fetch the user and check isAdmin
            const user = await db.getUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
    
            if (!user.isAdmin) {
                throw new Error("Only admin users are allowed to add movies.");
            }
    
            // Add the movie
            await movie.create({
                title: title,
                description: description,
                genre: genre,
                image: image,
                cinema: cinemaId
            });
    
            return `${title} has been added to the system`;
        } catch (e) {
            console.log(e.message);
            throw new Error(`Unable to add ${title} to the system.`);
        }
    },
    
    async getUser(username,password) {
        try {
            let result = await user.findOne({username: username, password: password});
            return result;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving login credentials");
        }
    },
    async getUserById(id) {
        try {
            let result = await user.findById(id);
            return result;
        } catch (e) {
            console.log(e.message);
            throw new Error("Error retrieving user by ID");
        }
    },

    
    async updateToken(id,token) {
        try {
            await user.findByIdAndUpdate(id,{token:token});
            return;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error at the server. Please try again later.");
        }
    },

    async removeToken(id) {
        try {
            await user.findByIdAndUpdate(id, {$unset: {token: 1}});
            return;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error at the server. Please try again later.");
        }
    },
    async checkToken(token) {
        try {
            let result = await user.findOne({token:token});
            return result;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error at the server. Please try again later.");
        }
    },


    async getMovieByTitle(conditions) {
        try {
            let results = await movie.find(conditions);
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving movie");
        }
    },
    async getMovieById(id) {
        try {
            let results = await movie.findById(id);
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving movie");
        }
    },


    async register(name, username,email,password) {
        try {
            await user.create({
                name: name,
                username: username,
                email:email,
                password: password,
                playlists: [],

            
            })
            return `${username} has successfully registered  `;
        }
        catch(e) {
            console.log(e.message);
            throw new Error(`${username} unable to register`);
        }
    },
    // ...

// ...

async createPlaylist(userId, playlistName) {
    try {
        const userid = await user.findById(userId);
        if (!userid) {
            throw new Error("User not found");
        }

        const Playlist = await playlist.create({
            name: playlistName,
            movies: [],
        });

        userid.playlists.push(Playlist._id);
        await userid.save();

        return `${playlistName} playlist has been created`;
    } catch (error) {
        console.log(error.message);
        throw new Error("Error creating playlist");
    }
},


async getUserPlaylists(userId) {
    try {
        const userid = await user.findById(userId).populate('playlists');
        if (!userid) {
            throw new Error("User not found");
        }
        
        return userid.playlists;

    } catch (error) {
        console.error(error);
        throw new Error("Error retrieving user's playlists");
    }
},
async deletePlaylist(userId, playlistId) {
    try {
        // Delete the playlist from the 'playlists' collection
        await playlist.findByIdAndDelete(playlistId);

        // Remove the playlist reference from the user's 'playlists' array
        const User = await user.findByIdAndUpdate(userId, {
            $pull: { playlists: playlistId }
        });

        if (!User) {
            throw new Error("User not found");
        }

        return "Playlist deleted successfully";
    } catch (error) {
        console.log(error.message);
        throw new Error("Error deleting playlist");
    }
},

async updateUserProfile(userId, newProfileData) {
    try {
        const updatedUser = await user.findByIdAndUpdate(userId, newProfileData, { new: true });
        return updatedUser;
    } catch (error) {
        throw error;
    }
},


}

module.exports = db;
