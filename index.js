var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multer = require('multer');
var upload = multer();
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

User = require('./user-model');
Movie2 = require('./movie-model');

var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views','./views');

app.use('/images',express.static('images'));
app.use('/css',express.static('css'));
//app.use(express.static('public'));

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: false}));
//form-urlencoded
// for parsing application/json
app.use(bodyParser.json());
// for parsing multipart/form-data
app.use(upload.array());

app.use(session({secret: "Shh, its a secret"}));

//Require the Router we defined in movies.js 
var movies = require('./movies.js');
//Use the Router on the sub route /movies



app.use('/movies', movies);

app.get('/', function(req, res){
    res.render('signup');
});

 
app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/signup', function(req,res){
    console.log(req.body);
    var already = false;
    if(!req.body.username || !req.body.password){
        res.render('signup', {message: "Missing Username or Password!"});
    } else {
            var newUser = new User({
                username: req.body.username,
                password: req.body.password
            });
            newUser.save(function(err) {
                if (err) 
                    res.render('signup', {message: "User Account Already Exists"});
                else{
                    User.findOne({ username: req.body.username }, function(err, user) {
                        if (err) 
                            res.render('signup', {message: "Your User Not Found!"});
                        else{
                            // test a matching password
                            user.comparePassword(req.body.username, function(err, isMatch) {
                                if (err) 
                                    res.render('signup', {message: "Password error", unplacehdr: "Enter Your User Name", passplacehdr: "Enter Your Password"});
                                else{
                                    if(isMatch)
                                        res.render('signup', {message: "User Already Exists!",unplacehdr: "Enter Your User Name", passplacehdr: "Enter Your Password"});
                                    else  {    
                                        req.session.isAuthenticated = true                                  
                                        Movie2.find(function(err, response){
                                            var moviez = response;
                                            res.render('login',{message: "Please Enter Your New Credentials", unplacehdr: req.body.username, passplacehdr: "Enter Your Password"});
                                        });
                                    }
                                }
                            });
                        }
                    });
    
                }
            });
        }
});

app.get('/login', function(req, res){
    res.render('login', {message: "Please Log In", unplacehdr: "Enter Your User Name", passplacehdr: "Enter Your Password"});
});

app.post('/login', function(req, res){
    console.log(req.body);
    var p_assword = req.body.password;
    if(!req.body.username || !req.body.password ){
        res.render('login', {message: "Please enter both id and password"});
    }
    else {
            User.findOne({ username: req.body.username }, function(err, user) {
            if (err) throw err;
            console.log(p_assword);
            user.comparePassword(p_assword, function(err, isMatch) {
                if (!isMatch)  res.render('login', {message: "Password Error!", mess_style:"color:red",unplacehdr:user.username,passplacehdr:"Input Password"});
                else{
                    Movie2.find(function(err, response){
                        console.log(user);
                        //res.json(response);
                        req.session.isAuthenticated = true 
                        res.render('movie_status', {message: "Welcome to Movie Data!", type: "list", movies:response,
                        theuser: user.username, loggedin:true, menu1:"Add New Movie", menu1link:"/movies/addmovie"});
                    });
                }
            });
        });      
    }
});

app.get('/logout', function(req, res){
    if(typeof(req.session.isAuthenticated) !== "undefined"){  
        console.log("There were " + req.session.page_views + " page views.");   
        req.session.destroy(function(){
            console.log("user logged out");
        });
        res.render('signup');
    } 
    else    
        res.render('signup');    
});

app.get('/testusers', function(req, res){    
    var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
    mongoose.connect(connStr, function(err) {
        if (err) throw err;
        console.log('Successfully connected to MongoDB');
    });

    // create a user a new user
    var testUser = new User({
        username: 'jmar777',
        password: 'Password123'
    });

    // save user to database
    testUser.save(function(err) {
        if (err) throw err;

        // fetch user and test password verification
        User.findOne({ username: 'jmar777' }, function(err, user) {
            if (err) throw err;

            // test a matching password
            user.comparePassword('Password123', function(err, isMatch) {
                if (err) throw err;
                console.log('Password123:', isMatch); // -> Password123: true
            });

            // test a failing password
            user.comparePassword('123Password', function(err, isMatch) {
                if (err) throw err;
                console.log('123Password:', isMatch); // -> 123Password: false
            });
        });
    });
});

app.get('/clearusers',function(req, res){
    User.find(function(err, response){
        console.log(response);
        var output_mess = '';
        response.forEach(function(user){      
            console.log(user.username);   
            User.findByIdAndRemove(user._id, function(err, response){
                if(err) output_mess += "Error in deleting user: " + user.username;
                else output_mess += "User: " + user.username + " removed.";
                console.log(output_mess);
            });
        });

    });
    res.json("Users Cleared");    
});


app.get('/newmovie', function(req, res){
    if(typeof(req.session.isAuthenticated) !== "undefined"){ 
        res.render('newmovie',{type: "new",hstyle:"color:rgb(10,150,10)",api_type: "POST", button_text: "Save Movie", 
            action_route: "/movies/", movie: {name: "Movie Name", year: "Year of Movie", rating: "Movie Rating"}, header_message: "Input New Movie"});
    } 
    else    
        res.render('signup');    
});

app.use(function(req, res, next){
        if(req.session.page_views){
            req.session.page_views++;
            console.log("Number of page views: " + req.session.page_views);
         } else {
            req.session.page_views = 1;
            console.log("Number of page views: " + req.session.page_views);
         }
         next();
 });

app.use(function(err, req, res, next){
    res.status(500);
    res.send("Oops, something went wrong. Info: " + err);
});


app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.\n');
});



app.listen(8082);
