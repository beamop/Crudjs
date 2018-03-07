var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// register
router.get('/register', isAuthenticated, function(req, res) {
    res.render('register');
});

// login
router.get('/login', isAuthenticated, function(req, res) {
    res.render('login');
});

function isAuthenticated(req, res, next) {
    if (req.isUnauthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are already logged in!');
        res.redirect('/');
    }
}

// register
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // validation
    req.checkBody('name', 'Name is required to register').notEmpty();
    req.checkBody('email', 'Email is required to register').notEmpty();
    req.checkBody('email', 'Email is not valid to register').isEmail();
    req.checkBody('username', 'Username is required to register').notEmpty();
    req.checkBody('password', 'Password is required to register').notEmpty();
    req.checkBody('password2', 'Passwords do not match to register').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors:errors
        });
    } else {
        console.log('[info] registration passed!');
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            // console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login!');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown user!'
                })
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid username or password!'
                    })
                }
            })
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out!');

    res.redirect('/users/login');
});

module.exports = router;