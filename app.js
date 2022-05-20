// Practice the levels of authentication and security
// Level 1, store user and password in plain text on server.
// Level 2 will use mongoose-encryption module AES-256, this encrypts the values, but the secret string is easily found.
// Level 2 will add dotenv for environmental variables.
// Level 3 uses Hashing to securly store the password. npm i md5 (we remove mongoose Encryption)

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//require mongoose, setup local connection (or atlas ect), setup schema, create model, register post ect/

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


// Create mongoose model
const User = mongoose.model("User", userSchema);

// Create a new user from the register page.
app.post("/register", function(req,res){
  User.create({
    email: req.body.username,
    password: md5(req.body.password)
  }, function(err){
      if (err){
        console.log(err);
      }
      else {
        res.render("secrets");
      }
    } //end callback
  ); // end create
}); //end post

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne( {email: username }, function(err, foundUser){
      if(err){
        console.log(err);
      } else if(foundUser){
            if (foundUser.password === password){
              console.log("Creditials Match");
              res.render("secrets");
            }else{
              console.log("No password match.");
              res.render("login");
            }
        } else {
          console.log("No matching users found");
          res.render("login");
        }
    });//end find

}); //end post


app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});


app.listen(3000, function(){
  console.log("Server Started on port 3000");
});
