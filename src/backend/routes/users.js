var express = require('express');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var passport = require('passport');
var user = require('../db_schema/user_schema');
var router = express.Router();
require('../config/passport')(passport);

mongoose.connect('mongodb://localhost/messgrace');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//get request display signup page
router.get('/signup', function(req, res) {
    res.render('signup');
});

//get request to display login page
router.get('/login', function(req, res) {
    error = req.query.error;
    res.render('login',{
        error : error
    });
});



//display home for the logged in user
router.get('/calender', function(req, res) {
    if (!req.session.user) {
        res.redirect('login',{error:req.query.error});
    } else if (req.session.user) {
        res.render('index',{user:req.session.user});
    }
});
//logout the user and destroy the session
router.get('/logout', function(req, res) {
    if (req.session.user) {
        req.session.destroy();
        res.redirect('/users/login?error=Logged Out');
        console.log('true');
    } else {
        res.redirect('/users/login?error=Logged Out');
    }
});
router.get('/dashboard', function(req, res){
    // file.find({username: req.session.user}).sort('-createdAt').exec(function(err, files){
    //     if(err) throw err;
    //     else{
    //         res.render('dashboard',{
    //             files: files
    //         });
    //     }
    // });
    res.send("under construction come back later!");
});

router.get('/auth/google',
  passport.authenticate('google',{scope:['profile','email']}));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users/login?error=Invalid domain name. Use Bits mail' }),
  function(req, res) {
    console.log('The google user details are: '+req.user);
    req.session.user = req.user.google.name;
    res.redirect('/users/calender');

  });
module.exports = router;