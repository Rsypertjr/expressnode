var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var upload = multer();

var app = express();
app.set('view engine', 'pug');
app.set('views','./views');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true }));
app.use(upload.array());

// for parsing application/json
app.use(bodyParser.json());

//Require the Router we defined in movies.js 
var movies = require('./movies.js');

//Use the Router on the sub route /movies
app.use('/movies', movies);

app.get('/newmovie', function(req, res){
    res.render('newmovie',{type: "new",hstyle:"color:rgb(10,150,10)",api_type: "POST", button_text: "Save Movie", action_route: "/movies/", movie: {name: "Movie Name", year: "Year of Movie", rating: "Movie Rating"}, header_message: "Input New Movie"});
});


app.listen(8080);