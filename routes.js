const express = require('express');
const router = express.Router();
const db = require("./services/dbservice.js");

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

router.post('/api/movies', function (req, res) {
    let data = req.body;
    db.addMovie(data.title, data.description,data.genre,data.releaseDate,data.duration, data.director,data.rating)
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.get('/api/movies',function(req,res) {
    db.getAllMovies()
    .then(function(response){
        res.status(200).json(response);
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.get('/api/movie/title/:value',function(req,res) {
    let value = req.params.value; //try to get data from url
    db.getMovieByTitle({ title: value })
    .then(function(response){
        res.status(200).json(response);
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.put('/api/movie/title/:value',function(req,res) {
    let value = req.params.value;
    let data = req.body;
    db.updateMovie({ title: value },{title:data.title,description:data.description,genre:data.genre,releaseDate:data.releaseDate,duration:data.duration,director:data.director,rating:data.rating})
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.delete('/api/movie/title/:value',function(req,res){
    let value = req.params.value;
    db.deleteMovie({title:value})
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.post('/api/movie/search',function(req,res) {
    let data = req.body; //get data from body of postman
    db.SearchMovie( data.title)
    .then(function(response){
        res.status(200).json(response);
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

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

router.post('/api/theater', function (req, res) {
    let data = req.body;
    db.addTheater(data.name, data.address,data.city,data.phone,data.email)
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.post('/api/theater/search',function(req,res) {
    let data = req.body; //get data from body of postman
    db.SearchTheater( data.name)
    .then(function(response){
        res.status(200).json(response);
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

router.put('/api/theater/name/:value',function(req,res) {
    let value = req.params.value;
    let data = req.body;
    db.updateTheater({ name: value },{name:data.name,address:data.address,city:data.city,phone:data.phone,email:data.email})
    .then(function(response){
        res.status(200).json({"message":response});
    })
    .catch(function(error){
        res.status(500).json({"message":error.message});
    });
})

module.exports = router;