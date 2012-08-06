/**
 * Module dependencies.
 */

var express = require('express')
,	app = module.exports = express.createServer()
,	mongoose = require('mongoose')
,	db = mongoose.connect('mongodb://spoeken:by-ge@ds033457.mongolab.com:33457/acms')
,	Schema = mongoose.Schema
,	ObjectId = Schema.ObjectId
,	passport = require('passport')
,	LocalStrategy = require('passport-local').Strategy
,	fs = require('fs')
,	menu = [];

function include(file){
	eval(fs.readFileSync(file)+'');
}

include('./includes/newPostType.js');

//Passport

var users = [
	{ id: 1, username: 'mathias', password: 'hemmelig', email: 'bob@example.com' }
,	{ id: 2, username: 'eivind', password: 'hemmelig', email: 'joe@example.com' }
];

function findById(id, fn) {
	var idx = id - 1;
	if (users[idx]) {
		fn(null, users[idx]);
	} else {
		fn(new Error('User ' + id + ' does not exist'));
	}
}

function findByUsername(username, fn) {
	for (var i = 0, len = users.length; i < len; i++) {
		var user = users[i];
		if (user.username === username) {
			return fn(null, user);
		}
	}
	return fn(null, null);
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			findByUsername(username, function(err, user) {
				if (err) { return done(err); }
				if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
				if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
				return done(null, user);
			})
		});
	}
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login?warning=You have to be logged in to access that area')
}



// Configuration

app.configure(function () {
    'use strict';
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(function(req, res, next){
		res.locals.url = req.url;
		next();
	});
	app.use(function(req, res, next){
		res.locals.host = 'http://' + req.headers.host;
		res.locals.query = req.query;
		res.locals.menu = menu;
		next();
	});
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    'use strict';
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    'use strict';
	app.use(express.errorHandler());
});



/*----------------------------/
	READ FUNCTIONS
---------------------------*/

function getPostBySlug(postType, $slug, $cb){
	postType.find({slug: $slug}, function(err, data) {
	  	data.forEach(function(elem, index, array){
		  	$cb(elem); 
	  	});
	});	
}

function getAllPosts(postType, type, $cb){
	console.log(postType+"/"+type);
	postType.find({type: type}, function(err, data) {
		if(!err){
			$cb(data);  
		}	
		else{
			console.log(err);
		}
	});	
}


// Routes

app.get('/',function(req, res){
	console.log(menu);
	res.redirect('/blog/');
});

/*----------------------------/
	LOGIN LOGOUT
---------------------------*/

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.get('/login',function(req, res){
	res.render('login', {page: {title:"Login"}});
});

app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/login?error=Username and/or password incorrect', failureFlash: false }),
	function(req, res) {
		res.redirect('/admin/posts');
});

/*----------------------------/
	Post Types
---------------------------*/

addNewPostType({
	slug: "blog"
,	labels: {
		plural: "Posts"
	,	singular: "Post"
	}
,	archive: true
	
});

addNewPostType({
	slug: "products"
,	labels: {
		plural: "products"
	,	singular: "product"
	}
,	archive: true
	
});


var port = process.env.PORT || 20095;
app.listen(port);
console.log('Express server listening on port %d in %s mode', port, app.settings.env);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.

