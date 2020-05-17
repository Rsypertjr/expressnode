var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'),
Movie2 = require('./movie-model');

router.get('/setup',function(req, res){
    var movies = [
        { id: 101, name: "Fight Club", year: 1999, rating: 8.1},
        { id: 102, name: "Inception", year: 2010, rating: 8.7},
        { id: 103, name: "The Dark Knight", year: 2008, rating: 9},
        { id: 104,name: "12 Angry Men", year: 1957, rating: 8.9}
    ];
    
    
    movies.forEach(moviesetup);
    function moviesetup(movie){
            var found = false;
            var newMovie = new Movie2({
                id: movie.id,
                name: movie.name,
                year: movie.year,
                rating: movie.rating
            });
            
            Movie2.find({"name": movie.name}, function(err, response){
                if (response[0] == null) {
                    newMovie.save(function(err, Movie){
                        if(err)
                            console.log("Database error");
                        else
                        console.log("New movie: " + newMovie.name + " is added!");
                    }); 
                }
                else  {
                    console.log("Movie: " + movie.name + " is already found!");
                }
            });  


          
         
    }
    
    res.redirect('/movies/');
});
       
router.get('/clear',function(req, res){
    Movie2.find(function(err, response){
        console.log(response);
        var output_mess = '';
        response.forEach(function(movie){      
            console.log(movie._id);    
            console.log(movie.id);  
            Movie2.findByIdAndRemove(movie._id, function(err, response){
                if(err) output_mess += "Error in deleting record id " + movie.id;
                else output_mess += "Movie: " + movie.name + " with id " + movie.id + " removed.";               
            });
        });
        res.redirect('/movies/');
    });
    
});

/* Test with : curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET 
localhost:3000/movies */
router.get('/', function(req, res){
    if(typeof(req.session.isAuthenticated) !== "undefined"){
        Movie2.find(function(err, response){
            console.log(response);
            //res.json(response);
            res.render('movie_status', { movies: response, message:"Welcome to Movie Data",type: "list",loggedin:true, 
                menu1:"Add New Movie",menu1link:"/movies/addmovie"});
        
        });
    }
    else    
        res.render('signup');
   
});


router.get('/:id([0-9]{3,})', function(req, res){ 
    if(typeof(req.session.isAuthenticated) !== "undefined"){
        Movie2.find({"id": req.params.id}, function(err, response){
            if (err) console.log("Error finding movie with id: " + req.params.id);
            else  {
                res.json(response);
            }
        });  
    }
    else    
        res.render('signup');
});

/* Tested with: curl -X POST -H "Content-Type: application/json"  -d '{"name":"Toy Story","year":"1995","rating":"8.5"}' http://localhost:3000/movies
*/
router.post('/',function(req, res){
    if(typeof(req.session.isAuthenticated) !== "undefined"){
        //Check if all fields are provided and are valid:
        if(!req.body.name ||
            !req.body.year.toString().match(/^[0-9]{4}$/g)||
            !req.body.rating.toString().match(/^[0-9](\.[0-9]){0,}$/g)){
                res.render('newmovie',{type: "new",hstyle:"color:red",movie: {name: "Movie Name", year: "Year of Movie",rating: "Movie Rating"}, 
                    api_type: "POST", button_text: "Save Movie", action_route: '/movies/', header_message: "Please Input Correct Movie Info"});
            } else{
            Movie2.find(function(err, response){
                var moviez = response;
                var newId = response[response.length-1].id + 1;
                var found = false;
                var newMovie = new Movie2({
                    id: newId,
                    name: req.body.name,
                    year: req.body.year,
                    rating: req.body.rating
                });
                moviez.forEach(function(movie){
                    found = false;
                    if(movie.name == newMovie.name){
                        found = true;
                        Movie2.find(function(err, response){
                            console.log(response);
                            res.render('movie_status', {message: "Movie: " + movie.name + " Already Has!", type: "repeat", movie: newMovie,
                                menu1:"Add a Movie",menu1link:"/movies/addmovie", loggedin:true,movies:response });
                        });
                    }                   
                });
                if(!found){
                    newMovie.save(function(err, Movie){
                        if(err)
                            res.render('movie_status', {message: "Database error", type: "error"});
                        else
                            Movie2.find(function(err, response){
                                console.log(response);
                                //res.json(response);
                                res.render('movie_status', {message: newMovie.name + " Movie Added!", movies:response,loggedin:true,menu1:"Add a Movie",menu1link:"/movies/addmovie" });
                            });
                            
                    }); 
                }
            });
        }
    }
    else    
        res.render('signup');
});

/* Tested with:  curl -X PUT -H "Content-Type: application/json"  -d '{"name":"Toy Story","year":"1995","rating":"9.5"}' http://localhost:3000/movies/105
*/                 
router.get('/edit/:id', function(req, res){ 
    if(typeof(req.session.isAuthenticated) !== "undefined"){  
        Movie2.find({"id": req.params.id}, function(err, response){
            if (err) console.log("Error finding movie with id: " + req.params.id);
            else  {
                //console.log(response);
                res.render('newmovie',{type: "edit",hstyle:"color:rgb(255,0,175)", movie: response[0], api_type: "POST", button_text: "Update Movie", 
                action_route: '/movies/update', header_message: "Edit Move: " + response[0].name,menu1:"Movie Dashboard",menu1link:"/movies"});
            }
        });  
    }
    else    
        res.render('signup');
});


router.post('/update', function(req, res){   
    if(typeof(req.session.isAuthenticated) !== "undefined"){   
    /* Movie2.findOneAndUpdate({name:req.body.name},{year: req.body.year,rating: req.body.rating},function(err, response){
            console.log(response);
        });   */
        var updated = req.body;
        Movie2.find({"id": req.body.id}, function(err, response){        
            if (err) console.log("Error finding movie with id: " + req.body.id);
            else  {
                console.log(req.body);
                console.log(response[0]._id);
                Movie2.findByIdAndUpdate(response[0]._id,req.body,function(err,response2){
                    if (err) console.log("Error Updating movie with id: " + req.body.id);
                    //console.log(response2);
                    Movie2.find(function(err, response3){
                        console.log(response3);
                        res.render('movie_status', {message: updated.name + " Movie Updated!", movies:response3,loggedin:true,menu1:"Add New Movie",menu1link:"/movies/addmovie" });
                    });
                });
            
            }
        });  
    }
    else    
        res.render('signup');
  
});

router.get('/addmovie', function(req, res){ 
    if(typeof(req.session.isAuthenticated) !== "undefined"){  
        Movie2.find(function(err, response){
            console.log(response);
            var moviez = response;
            var newId = response[response.length-1].id + 1;
            res.render('newmovie',{type: "new",hstyle: "color:blue", header_message: "Add New Movie",movie: {id: newId,name: "Movie Name", 
                year: "Year of Movie",rating: "Movie Rating"},api_type: "post", button_text: "Save Movie", action_route: '/movies',
                menu1:"Movie Dashboard",menu1link:"/movies", loggedin:true,movies:response});
        });
    }
    else    
        res.render('signup');
});


/* Tested with:  curl -X DELETE -H "Content-Type: application/json"  -d '{"name":"Toy Story","year":"1995","rating":"9.5"}' http://localhost:3000/movies/105
*/
router.get('/delete/:id', function(req, res){
    if(typeof(req.session.isAuthenticated) !== "undefined"){  
        Movie2.find({"id": req.params.id}, function(err, response){
            console.log(req.params);
            var mname = req.params.name;
            if (err) console.log("Error finding movie with id: " + req.params.id);
            else  {
                console.log(response[0]._id);
                const movie = response[0];
                Movie2.findByIdAndRemove(response[0]._id,function(err,response){
                    if (err) console.log("Error Deleting movie with id: " + req.params.id);
                    else  {
                        Movie2.find(function(err, response){
                            console.log(response);
                            res.render('movie_status', {message: movie.name + " Movie Deleted!", movies:response,loggedin:true,menu1:"Add New Movie",menu1link:"/movies/addmovie" });
                        });
                    }
                    
                });
            
            }
        }); 
    } 
    else    
        res.render('signup');
});


module.exports = router;