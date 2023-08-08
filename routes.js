const express = require('express');
const router = express.Router();
const db = require("./services/dbservice.js");
const crypto = require('crypto');
const mongoose = require('mongoose');
const playlist = require('./models/playlist.js'); // Import the Playlist model
const user = require('./models/user.js');

db.connect()
.then(function(response){
    console.log(response);
})
.catch(function(error){
    console.log(error.message);
});

router.use(express.urlencoded({
    extended: true
}));

router.get('/', function(req,res) {
    res.sendFile(__dirname+"/views/index.html");
})

router.get('/login', function(req,res) {
    res.sendFile(__dirname+"/views/login.html");
})
router.get('/register', function(req,res) {
    res.sendFile(__dirname+"/views/register.html");
})

router.get('/addMovie', function(req,res) {
    res.sendFile(__dirname+"/views/addMovie.html");
})

router.get('/playlist', function (req, res) {
    res.sendFile(__dirname + "/views/playlist.html");
});

router.get('/profile', function (req, res) {
    res.sendFile(__dirname + "/views/profile.html");
});

router.use(express.json());

function authenticationCheck(req,res,next) {
    //check if query token is in the url
    let token = req.query.token;
    if(!token) {
        res.status(401).json({"message":"No tokens are provided."});
        return res.redirect('/login');
    } else {
        db.checkToken(token)
        .then(function(response){
            //Matched token in the db, proceed with the request
            if(response) {
                //response = organizer who is logged in.
                // store the organizer's id in local memory to be used in the route handler
                res.locals.userId = response._id;
                res.locals.isAdmin = response.isAdmin;
                next();
            } else {
                res.status(401).json({"message":"Invalid token provided."});
            }
        })
        .catch(function(error){
            res.status(500).json({"message":error.message});
        });
    }
}
router.get('/api/users/logout',authenticationCheck);
router.post('/api/movies',authenticationCheck);
router.get('/api/playlist',authenticationCheck);
router.get('/api/profile/update',authenticationCheck);
router.get('/api/cinemas',authenticationCheck);

router.get('/api/cinemas',function(req,res) {
    db.getAllCinemas()
    .then(function(response){
        res.status(200).json(response);
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

// ...

router.get('/api/movies', async function(req, res) {
    const title = req.query.title; // Get the title query parameter
    
    if (title) {
        const conditions = { title: { $regex: title, $options: 'i' } }; // Case-insensitive regex search
        try {
            const results = await db.getMovieByTitle(conditions);
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({"message": error.message});
        }
    } else {
        // If no title query parameter, fetch all movies
        try {
            const results = await db.getAllMovies();
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({"message": error.message});
        }
    }
});


router.post('/api/movies', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const isAdmin = res.locals.isAdmin; // Retrieve isAdmin from authentication middleware
    const data = req.body;

    if (!isAdmin) {
        res.status(403).json({ "message": "Permission denied. Only admins can add movies." });
        return;
    }

    try {
        const response = await db.addMovie(data.title, data.description, data.genre, data.image, data.cinemaId, userId); // Pass userId to addMovie
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});



router.post('/api/users',function(req,res) {
    let data = req.body;
    db.register(data.name,data.username,data.email,data.password)
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.post('/api/users/login',function(req,res){
    let data = req.body;
    db.getUser(data.username,data.password)
    .then(function(response){
        if(!response) {
            res.status(401).json({"message":"Login unsuccessful. Please try again later."});
        } 
        else {
            let strToHash = response.username + Date.now();
            let token = crypto.createHash('md5').update(strToHash).digest('hex');
            db.updateToken(response._id,token)
            .then(function(response){
                res.status(200).json({'message':'Login successful','token':token});
            })
            .catch(function(error){
                res.status(500).json({"message":error.message});
            })
        }   
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    })
})
router.get('/api/playlists', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;

    try {
        const userPlaylists = await db.getUserPlaylists(userId);
        res.status(200).json(userPlaylists);
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});



router.get('/api/users/logout',function(req,res){
    //retrieve the id that was stored earlier in the middleware.
    let id = res.locals.userId;
    db.removeToken(id)
    .then(function(response){
        res.status(200).json({'message':'Logout successful'});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    })
})

// ...

router.post('/api/playlist/create', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const playlistName = req.body.playlistName;

    try {
        const response = await db.createPlaylist(userId, playlistName);
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});


router.delete('/api/playlists/:playlistId', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const playlistId = req.params.playlistId;

    try {
        // Delete the playlist from the 'playlists' collection
        await playlist.findByIdAndDelete(playlistId);

        // Remove the playlist reference from the user's 'playlists' array
        const users = await user.findByIdAndUpdate(userId, {
            $pull: { playlists: playlistId }
        });

        if (!users) {
            res.status(404).json({ "message": "User not found" });
            return;
        }

        res.status(200).json({ "message": "Playlist deleted successfully" });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});

router.post('/api/playlist/:playlistId/addMovie', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const playlistId = req.params.playlistId;
    const movieId = req.body.movieId;

    try {
        // Find user and playlist
        const currentUser = await user.findById(userId);
        const targetPlaylist = await playlist.findById(playlistId);

        if (!currentUser || !targetPlaylist) {
            res.status(404).json({ "message": "User or playlist not found" });
            return;
        }

        // Add movie to playlist
        targetPlaylist.movies.push(movieId);
        await targetPlaylist.save();

        res.status(200).json({ "message": "Movie added to playlist successfully" });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});
router.get('/api/movies/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    try {
        const movie = await db.getMovieById(movieId);
        if (!movie) {
            res.status(404).json({ "message": "Movie not found" });
            return;
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});

router.delete('/api/playlists/:playlistId/removeMovie/:movieId', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const playlistId = req.params.playlistId;
    const movieId = req.params.movieId;

    try {
        const Playlist = await playlist
    .findOne({ _id: playlistId })
    .populate('movies');

if (!Playlist) {
    res.status(404).json({ "message": "Playlist not found" });
    return;
}

        const movieToRemove = Playlist.movies.find(movie => movie._id.toString() === movieId);

        if (!movieToRemove) {
            res.status(404).json({ "message": "Movie not found in playlist" });
            return;
        }

        Playlist.movies.pull(movieId);
        await Playlist.save();

        res.status(200).json({ "message": "Movie removed from playlist successfully" });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});


router.get('/api/users/profile', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;

    try {
        const user = await db.getUserById(userId);
        if (!user) {
            res.status(404).json({ "message": "User not found" });
            return;
        }
        // Exclude sensitive data like password
        const userProfile = {
            name: user.name,
            email: user.email
        };
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});

router.patch('/api/users/profile', authenticationCheck, async function (req, res) {
    const userId = res.locals.userId;
    const updateData = req.body;

    try {
        const updatedUser = await db.updateUserProfile(userId, updateData);
        res.status(200).json({ "message": "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
});









module.exports = router;