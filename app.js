
/**
 * Module dependencies.
 */

var express = require('express')
,	app = module.exports = express.createServer()
,	mongoose = require('mongoose')
,	db = mongoose.connect('mongodb://localhost/acms')
,	Schema = mongoose.Schema
,	ObjectId = Schema.ObjectId;

// Configuration

var MemStore = express.session.MemoryStore;

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
		next();
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ store: MemStore( { reapInterval: 60000 * 10 }), secret: 'microrcim' }));
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


//Middleware
	
	function requiresLogin(req, res, next){
		if(req.session.user){
			next();
		}else {
			res.redirect('/login?reddir=' + req.url);
		}
	}



//Define schemas
var pages = new Schema({
    author	: ObjectId
  , title	: String
  , slug	: String
  , content	: String
  , type	: String
  , buf		: Buffer	//Don't know how this works
  , date	: Date	//Don't know how this works
});

var page = db.model('pages', pages);

var posts = new Schema({
    author	: ObjectId
  , title	: String
  , slug	: String
  , content	: String
  , type	: String
  , buf		: Buffer	//Don't know how this works
  , date	: Date	//Don't know how this works
});

var post = db.model('post', posts);

// Database Functions

function createNewPage(){
	var instance = new page();
	instance.title = 'This is a post';
	instance.slug = "myfirstpost";
	instance.content = "Proin vestibulum. Ut ligula. Nullam sed dolor id odio volutpat pulvinar. Integer a leo. In et eros at neque pretium sagittis. Sed sodales lorem a ipsum suscipit gravida. Ut fringilla placerat arcu. Phasellus imperdiet. Mauris ac justo et turpis pharetra vulputate";
	
	instance.save(function (err) {
		if (!err){
			 console.log('Instance saved. Title:'+ instance.title);	
		}
		else{
			 console.log('Could not save instance. Error: '+ err);	
		}
	});		
}
	
//createNewPage();


function getTitleBySlug($slug, $cb){
	page.find({slug: $slug}, function(err, data) {
	  	data.forEach(function(elem, index, array){
		  	$cb(elem); 
	  	});
	});	
}

function getPostBySlug($slug, $cb){
	post.find({slug: $slug}, function(err, data) {
	  	data.forEach(function(elem, index, array){
		  	$cb(elem); 
	  	});
	});	
}

function getAllPosts($cb){
	post.find({type: "post"}, function(err, data) {
		if(!err){
			$cb(data);  
		}	
		else{
			console.log(err);
		}
	});	
}



// Routes

	
	//Sessions
	
	var users = require('./users');
	
	app.get('/login',function(req, res){
		res.render('login', {page: {title: 'Login'}});
	});
	
	app.post('/sessions',function(req, res){
		users.authenticate(req.body.user, req.body.password, function(user){
			if(user){
				req.session.user = user;
				res.redirect(req.body.redir || '/'); 
			} else {
				res.redirect('/login?redir='+req.query.redir);
			}
		});
	
	});


app.get('/',function(req, res){
	res.redirect('/blog/');
});


// Save New Post
app.post('/admin/posts/addnewtodb', requiresLogin, function(req, res){
	if (req.body.title !== ""){
			var instance = new post();
			instance.title = req.body.title;
			instance.slug = req.body.slug;
			instance.content = req.body.content;
			instance.type = "post";
			instance.save(function (err) {
				if (!err){
					res.redirect('admin/posts/addnew?warning=The post was successfully created!');	
				}
				else{
					res.redirect('admin/posts/addnew?warning=Could not create post!');
				}
			});	
			
		}else {
			res.redirect('admin/posts/addnew?warning=Missing title!');
		}
});

//Delete Post by ID
app.post('/admin/posts/delete', requiresLogin, function(req, res){
	console.log(req.body);
	post.remove({_id: req.body.post_id}, function(err) { 
		if(!err){
			res.redirect('admin/posts?warning=The Post was deleted');	
		}
		else{
			res.redirect('admin/posts?warning=Could not delete post. Error: '+err);
		}
	});
});

//Add New Post
app.get('/admin/posts/addnew', requiresLogin, function(req, res){
	res.render('addPost', {page: {title: "Add New Post", content: "Add a new post"}});
});

//Edit Post
app.get('/admin/posts/edit', requiresLogin, function(req, res){
	post.findOne({_id: req.query.post_id}, function(err, data){
		console.log(data);
		res.render('editPost', {page: {title: "Edit Post", content: "Edit the post"}, post: data});
	});
});

//Save Edited Post
app.post('/admin/posts/edit/save', requiresLogin, function(req, res){
	post.findOne({_id: req.body.post_id}, function(err, data){
		data.title = req.body.title;
		data.slug = req.body.slug;
		data.content = req.body.content;
		
		data.save(function (err) {
			if (!err){
				res.redirect('admin/posts/edit?post_id='+req.body.post_id+'&warning=The post was successfully updated!');	
			}
			else{
				res.redirect('admin/posts/edit?post_id='+req.body.post_id+'&warning=Could not save post! Error:' + err);
			}
		});	
	});
});
// Show all Posts
app.get('/admin/posts', requiresLogin, function(req, res){
	getAllPosts(function(data){
		res.render('posts', {page: {title: "Posts" }, blogposts: data});
	});
});

app.get('/blog', function (req, res) {
    getAllPosts(function(data){
		res.render('blog', {page: {title: "a-cms blog", header: "Welcome to the a-cms blog. It is super effective at teaching you how to use a-cms" }, blogposts: data});
	});
});

//Single Post
app.get('/blog/:slug', function(req, res){
	getPostBySlug(req.params.slug, function(data){
		res.render('singlepost', {page: data});	
	});
	
});

var port = process.env.PORT || 3300;
app.listen(port);
console.log('Express server listening on port %d in %s mode', port, app.settings.env);

