
app.get('/people', function(req, res){
    Person.find(function(err, response){
        res.json(response);
    });
});

/*
// Updating Documents -- cannot use except within routes -- see below

Person.update({age: 25}, {nationality: "American"}, function(err, response){
   console.log(response);
});

Person.findOneAndUpdate({name: "Ayush"}, {age: 40}, function(err, response) {
   console.log(response);
});

Person.findByIdAndUpdate("507f1f77bcf86cd799439011", {name: "James"}, 
   function(err, response){
      console.log(response);
});

*/


app.get('/person', function(req, res){
    res.render('person');
});

app.post('/person', function(req, res){
    var personInfo = req.body; //Get the parsed information

    if(!personInfo.name || !personInfo.age || !personInfo.nationality){
        res.render('show_message', {
            message: "Sorry, you provided wrong info", type: "error"});
    } 
    else{
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function(err, Person){
            if(err)
                res.render('show_message', {message: "Database error", type: "error"});
            else
                res.render('show_message',{
                    message: "New person added", type: "success", person: personInfo
                });
        });
    }

});



// Test with: curl -X PUT -H "Content-Type: application/json"  -d '{"name":"James","age":"20","nationality":"American"}' 
//            http://localhost:3000/people/5eb1ed599463ba1d00d0ddcb
app.put('/people/:id', function(req, res){
    Person.findByIdAndUpdate(req.params.id, req.body, function(err, response){
        if(err) res.json({message: "Error in updating person with id " + req.parames.id });
        res.json(response);
    });

});

// Test with: curl -X DELETE http://localhost:3000/people/5eb1ecb59463ba1d00d0ddc8
app.delete('/people/:id', function(req, res){
    Person.findByIdAndRemove(req.params.id, function(err, response){
        if(err) res.json({message: "Error in deleting record id " + req.params.id});
        else res.json({message: "Person with id " + req.params.id + " removed."});
    });
});


