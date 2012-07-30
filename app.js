
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/blog', function(req, res){
  res.render('blogposts', {
    title: 'a-cms blog',
    lang: 'en',
    header: "Welcome to the a-cms blog. It is super effective at teaching you how to use a-cms",
    blogposts: [{title:"My first blogpost", content: "This is my first blogpost and I am very proud"},{title: "How much i love cats", content: "I like cats very much, they are super effective"}, {title: "I might like dogs the best", content: "Dogs are super awesome, they have paws and smell very well. They like people, unlike those darn cats..."}]
  });
});

var port = process.env.PORT || 3300;
app.listen(port);
console.log('Express server listening on port %d in %s mode', port, app.settings.env);
