//jshint esversion:6
require("dotenv").config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(                      // IMPORTANT
  {                                   // TO
    secret: "Our little secret.",     // PLACE
    resave: false,                    // IT
    saveUninitialized: false          // EXACTLY
  })                                  // RIGHT
);                                    // HERE
app.use(passport.initialize());       // THIS AS WELL
app.use(passport.session());          // AND THIS AS WELL


mongoose.connect("mongodb://localhost:3000:27017/userDB", { useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({  // added 'new mongoose.Schema because of encryption!
  emaiL: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function(req, res) {
  res.render('home');
});


app.get('/login', function(req, res) {
  res.render('login');
});


app.get('/register', function(req, res) {
  res.render('register');
});


app.get("/secrets", (req, res) => {
  if (req.isAuthenticated) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});


app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})


app.post("/register", (req, res) => {

  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      res.render(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

/*   bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const newUser = new User({
      emaiL: req.body.username,
      password: hash
    });
  
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  }); */

});


app.post("/login", (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      res.render(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  })

  /* const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, (error, result) => {
            if (result) {
              res.render("secrets");
            }
          });
        } else {
          res.send("Something went wrong!");
        }
      }
    }); */
    
});


app.listen(3000, function() {
  console.log('This server started on port 3000!');
});