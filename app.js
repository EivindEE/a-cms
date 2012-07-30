var http = require('http'),
	mongoose = require('mongoose'),	
	db = mongoose.connect('mongodb://localhost/nodeblog');
	
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
//Define a scema
var page = new Schema({
    author    : ObjectId
  , title     : String
  , slug     : String
  , content      : String
  , buf       : Buffer	//Don't know how this works
  , date      : Date	//Don't know how this works
});

var MyModel = db.model('pages', page);

function createNewInstance(){
	var instance = new MyModel();
	instance.title = 'This is a page';
	instance.slug = "testpage";
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

//createNewInstance();


function getTitleBySlug($slug, $cb){
	MyModel.find({slug: $slug}, function(err, docs) {
	  	docs.forEach(function(elem, index, array){
		  	console.log(elem.title);
		  	$cb(elem.title); 
	  	});
	});	
}



var server = http.createServer(function(request, response){
	
	
	getTitleBySlug('testpage', function(val){
		response.writeHead(200, {
			"Content" : "text/html"
		});
		response.write('<html><head><title>'+val+'</title></head><body>');
		response.write('<h1>'+val+'</h1>');
		response.write('<p>'+val+'</p>');
		response.write('</body></html>');
		response.end();
	});
	
	
})

server.listen(8000, 'nodeblog.lo');

console.log('Listening on http://127.0.0.1:8000');