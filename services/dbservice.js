const mongoose = require('mongoose');
const movie = require("../models/movie.js");
const user = require('../models/user.js');
const e = require('express');
const theater = require('../models/theater.js');

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
    async addMovie(title, description, genre, releaseDate,duration,director,rating ) {
        try {
            await movie.create({
                title: title,
                description: description,
                genre:genre,
                release: {
                    date: releaseDate,
                },
                duration:duration,
                director:director,
                rating:rating,

            });
            // return "Event name: "+name+" has been added";
            return `Movie name: ${title} has been added`;
        }
        catch(e) {
            console.log(e.message);
            throw new Error(`Movie name: ${title} was not added.`);
        }
    },

    async getAllMovies() {
        try {
            let results = await movie.find();
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error retrieving movies");
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

    async updateMovie(conditions, updates) {
        try {
            let result = await movie.findOneAndUpdate(conditions, updates)
            if (!result) return "Unable to find record to update.";
            else return "Movie is updated!";
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error updating Movie");
        }
    },

    async deleteMovie(conditions) {
        try {
            let result = await movie.findOneAndDelete(conditions);
            if (!result) return "Unable to find a record to delete.";
            else return "Record is deleted!";
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error deleting movie");
        }
    },

    
    async SearchMovie(title) {
        try {
            let results = await movie.find({title:new RegExp(title,'i')});
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error('Unable to retrieve records');
        }
    },

    async register(name, username,email,password) {
        try {
            await user.create({
                name: name,
                username: username,
                email:email,
                password: password,
            
            })
            return `${username} has successfully registered  `;
        }
        catch(e) {
            console.log(e.message);
            throw new Error(`${username} unable to register`);
        }
    },

    async addTheater(name, address, city, phone,email ) {
        try {
            await theater.create({
                name: name,
                address: address,
                city:city,
                phone:phone,
                email:email,

            });
            return `Theater name: ${name} has been added`;
        }
        catch(e) {
            console.log(e.message);
            throw new Error(`Theater name: ${name} was not added.`);
        }
    },

    async SearchTheater(name) {
        try {
            let results = await theater.find({name:new RegExp(name,'i')});
            return results;
        }
        catch(e) {
            console.log(e.message);
            throw new Error('Unable to find thearter');
        }
    },

    async updateTheater(conditions, updates) {
        try {
            let result = await theater.findOneAndUpdate(conditions, updates)
            if (!result) return "Unable to find record to update.";
            else return "Theater is updated!";
        }
        catch(e) {
            console.log(e.message);
            throw new Error("Error updating Theater");
        }
    },
}

module.exports = db;
