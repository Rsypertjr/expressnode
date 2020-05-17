var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');



var movieSchema = mongoose.Schema({
    id: Number,
    name: String,
    year: Number,
    rating: Number
});
module.exports = mongoose.model("Movie2",movieSchema);