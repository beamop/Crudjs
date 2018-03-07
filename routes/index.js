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

// get add
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add');
});

// get list
router.get('/list', ensureAuthenticated, function(req, res) {
    News.find({}, function(err, docs) {
        if(err) res.json(err);
        else res.render('list', {news: docs});
    });
});

// get edit
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    var id = req.params.id;

    News.findOne({_id: id}, function(err, docs) {
        if(err) res.json(err);
        else res.render('edit', {id: id, news: docs});
    });

    console.log('[info] editing => ' + req.params.id);
});

// get delete
router.get('/delete/:id', ensureAuthenticated, function(req, res) {
    var id = req.params.id;

    News.find({_id: id}).remove().exec();

    console.log('[info] deleted => ' + req.params.id);

    req.flash('success_msg', 'You just delete the news ' + id + ' !');
    res.redirect('/list');
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
};

// add
router.post('/add', function(req, res) {
    var name = req.body.name;
    var content = req.body.content;

    // validation
    req.checkBody('name', 'Name of the news is required').notEmpty();
    req.checkBody('content', 'Content of the news is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('add', {
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

// edit
router.post('/edit/:id', function(req, res) {
    var id = req.params.id;
    var name = req.body.name;
    var content = req.body.content;

    // validation
    req.checkBody('name', 'Name of the news is required').notEmpty();
    req.checkBody('content', 'Content of the news is required').notEmpty();

    News.findOneAndUpdate({_id: id}, req.body, {new: true}, function (err, news) {
        req.flash('success_msg', 'You just edited the news!');
        res.redirect('/list');

        console.log('[info] edited => ' + req.params.id)
    });
})


router.get('/edit/:id', function(req, res) {
    var id = req.params.id;

    News.findOne({_id: id}, function(err, docs) {
        if(err) res.json(err);
        else res.render('edit', {id: id, news: docs});
    });

    console.log('[info] editing => ' + req.params.id);
});

module.exports = router;