
/**
 * Module dependencies.
 */

var express = require('express')
,	app = module.exports = express.createServer()
,	mongoose = require('mongoose')
,	db = mongoose.connect('mongodb://localhost/nodeblog')
,	Schema = mongoose.Schema
,	ObjectId = Schema.ObjectId;

// Configuration

app.configure(function () {
    'use strict';
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'your secret goes here' }));
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

//Define a schema
var page = new Schema({
    author	: ObjectId
  , title	: String
  , slug	: String
  , content	: String
  , buf		: Buffer	//Don't know how this works
  , date	: Date	//Don't know how this works
});

var pages = db.model('pages', page);

// Database Functions

function createNewPage(){
	var instance = new pages();
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
	pages.find({slug: $slug}, function(err, data) {
	  	data.forEach(function(elem, index, array){
		  	$cb(elem); 
	  	});
	});	
}


// Routes

app.get('/',function(req, res){
	getTitleBySlug('myfirstpost', function(data) { 
		res.render('index', {data: data});
	})
});

app.get('/blog', function (req, res) {
    'use strict';
	res.render('blogposts', {
		title: 'a-cms blog',
		lang: 'en',
		header: "Welcome to the a-cms blog. It is super effective at teaching you how to use a-cms",
		blogposts: [{title: "My first blogpost", content: "This is my first blogpost and I am very proud"}, {title: "How much i love cats", content: "I like cats very much, they are super effective"}, {title: "I might like dogs the best", content: "Dogs are super awesome, they have paws and smell very well. They like people, unlike those darn cats..."}]
	});
});

var port = process.env.PORT || 3300;
app.listen(port);
console.log('Express server listening on port %d in %s mode', port, app.settings.env);

