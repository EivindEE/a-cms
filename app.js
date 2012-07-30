
var app = require('express').createServer()
, mongoose = require('mongoose')
, db = mongoose.connect('mongodb://localhost/nodeblog')
, Schema = mongoose.Schema
, ObjectId = Schema.ObjectId;

//Setup express

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//Define a scema
var page = new Schema({
    author	: ObjectId
  , title	: String
  , slug	: String
  , content	: String
  , buf		: Buffer	//Don't know how this works
  , date	: Date	//Don't know how this works
});

var pages = db.model('pages', page);

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

app.get('/',function(req, res){
	getTitleBySlug('myfirstpost', function(data) { 
		console.log(data);
		res.render('index', {data: data});
	})
});




app.listen(8000);

console.log('Listening on http://127.0.0.1:8000');