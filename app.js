// Practice the levels of authentication and security
// Level 1, store user and password in plain text on server.
// Level 2 will use mongoose-encryption module AES-256, this encrypts the values, but the secret string is easily found.
// Level 2 will add dotenv for environmental variables.
// Level 3 uses Hashing to securly store the password. npm i md5 (we remove mongoose Encryption)
// Level 4 uses hashing with salt rounds to obscure passwords. npm install bcrypt
// Level 5 uses cookies and sessions. npm install passport passport-local passport-local-mongoose express-session
      // Setup express-session first,

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

// Session should be place below other app.set / app.use. and just above mongoose.connect.
// First we use session and feed the config settings.
// Second we initialize passport
// Third we tell passport to handle the session.
// Fourth we add the passport-local-mongoose plugin to the schema.
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


/////////////////////////////////////MONGOOSE AND SCHEMA SETUP ///////////////////////////////


// Require mongoose, setup local connection (or atlas ect), setup schema, create model, register post ect/
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Add passport to the mongoose Schema
userSchema.plugin(passportLocalMongoose);

// Create mongoose model
const User = mongoose.model("User", userSchema);

// From passport-local-mongoose. These save you from having to write more code from just using Passport.
passport.use(new LocalStrategy(User.authenticate()));

// These two are only needed when using sessions.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




///////////////////////////////////// AUTHENTICATION ROUTES ////////////////////////////////////////////



// Create a new user from the register page.
app.post("/register", function(req,res){

  // Use passport-local-mongoose as middleware for register
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req,res, function(){
        // Only enters this callback if it was successful
        res.redirect("/secrets"); // Will check authentication at page location.
      });
    }
  });

}); // End post

// Login for an existing user.
app.post("/login", function(req,res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  // Comes from Passport to login.
  req.login(user, function(err){
    if (err){
      console.log(err);
    } else {
        // Use Passport to authenticate user, then redirect to secrets.
        passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
      });
    }

  })

}); //end post



///////////////////////////////////// GENERAL ROUTES ////////////////////////////////////////////

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get('/logout', function(req, res, next) {
  //Use passport to log user out
  req.logout(function(err){
    console.log(err);
  });
  res.redirect('/');
});


app.get("/register", function(req,res){
  res.render("register");
});

app.get("/secrets", function(req,res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});


app.listen(3000, function(){
  console.log("Server Started on port 3000");
});
