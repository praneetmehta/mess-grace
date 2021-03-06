// config/passport.js
// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// load up the user model
var User       = require('../db_schema/user_schema');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log('serializing user.');
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user.');
            done(err, user);
        });
    });
    
    
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        profileFields: ['id', 'email', 'gender', 'displayName'],
        passReqToCallback: true

    },

    // facebook will send back the token and profile
    function(req,token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            if(profile._json.domain === 'hyderabad.bits-pilani.ac.in'){
                User.findOne({ 'google.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.google.id    = profile.id; // set the users facebook id                   
                    newUser.google.token = token; // we will save the token that facebook provides to the user                    
                    newUser.google.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.google.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
            }else{
                done(null, false,{message:'Invalid domain name'});

            }
        });

    }));

};