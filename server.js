var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
var app = express();
var googleProfile = {};

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret:config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName
        };
        cb(null, profile);
    }
));

app.set('view engine', 'pug');
app.set('views', './views');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
    //console.log('/: req.user:', req.user);//EKSPERYMENT dlaczego req.query.user jest undefined?
    //console.log('/: req.query.user:', req.query.user);//EKSPERYMENT dlaczego req.query.user jest undefined?
    //console.log('/: user:', user);//EKSPERYMENT dlaczego user not defined?
    res.render('index', { user: req.user });//skąd '/' wie kto to user ??? kto przekazuje user???
});

app.get('/logged', function(req, res){
    //console.log('/logged: googleProfile: ',googleProfile);//EKSPERYMENT
    res.render('logged', { user: googleProfile });//skąd '/logged' wie kto to user ??? z passport.use(new GoogleStrategy({...})???
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope : ['profile', 'email']
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/logged',
        failureRedirect: '/'
    })
);

var server = app.listen(3000, 'localhost', function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Aplikacja nasłuchuje na http://' + host + ':' + port);
});

app.use(function(req, res, next) {
    res.status(404).send('Very Fatal Error (code: ' + res.statusCode + '), everything gone very bad');
});