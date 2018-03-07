var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var News = require('../models/index');

// get homepage
router.get('/', function(req, res) {
	News.find({}, function(err, docs) {
		if(err) res.json(err);
		else res.render('index', {news: docs});
	});
});

// get add-news
router.get('/add-news', ensureAuthenticated, function(req, res) {
    res.render('add-news');
});

// get view
router.get('/view/:id', function(req, res) {
	var id = req.params.id;

	News.findOne({_id: id}, function(err, docs) {
		if(err) res.json(err);
		else res.render('view', {id: id, news: docs});
	});

	console.log('[info] get => ' + req.params.id);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in!');
        res.redirect('/users/login');
    }
}

// add-news
router.post('/add-news', function(req, res) {
    var name = req.body.name;
    var content = req.body.content;
    var date = req.body.date;

    // validation
    req.checkBody('name', 'Name of the news is required').notEmpty();
    req.checkBody('content', 'Content of the news is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('add-news', {
            errors:errors
        });
    } else {
        console.log('[info] news passed!');
        var newNews = new News({
            name: name,
            content: content
        });

        News.createNews(newNews, function (err, news) {
            if (err) throw err;
            // console.log(news);
        });

        req.flash('success_msg', 'The news has been sent to the server!');

        res.redirect('/');
    }
});

module.exports = router;