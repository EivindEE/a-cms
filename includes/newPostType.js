/*---------------------------------------------------/
	ADD NEW POST POST TYPE FUNCTION
---------------------------------------------------*/

addNewPostType = function(settings){	
	
	/*----------------------------/
		SCHEMA
	---------------------------*/
	
	global[settings.labels.plural] = new Schema({
	    author	: ObjectId
	  , title	: String
	  , slug	: String
	  , content	: String
	  , type	: String
	  , buf		: Buffer
	  , date	: Date
	});
	
	var postType = db.model(settings.labels.singular, global[settings.labels.plural]);
	
	/*----------------------------/
		DELETE
	---------------------------*/
	
	//Delete Post by ID
	app.post('/admin/'+settings.labels.plural+'/delete', ensureAuthenticated, function(req, res){
		console.log(req.body);
		postType.remove({_id: req.body.post_id}, function(err) { 
			if(!err){
				res.redirect('admin/'+settings.labels.plural+'?warning=The Post was deleted');	
			}
			else{
				res.redirect('admin/'+settings.labels.plural+'?warning=Could not delete '+settings.labels.singular+'. Error: '+err);
			}
		});
	});
	
	/*----------------------------/
		CREATE
	---------------------------*/
	
	//Add New Post
	app.get('/admin/'+settings.labels.plural+'/addnew', ensureAuthenticated, function(req, res){
		res.render('addPost', {page: {title: 'Add New '+settings.labels.singular, content: 'Add a new '+settings.labels.singular}});
	});
	
	// Save New Post
	app.post('/admin/'+settings.labels.plural+'/addnewtodb', ensureAuthenticated, function(req, res){
		if (req.body.title !== ""){
				var instance = new postType();
				instance.title = req.body.title;
				instance.slug = req.body.slug;
				instance.content = req.body.content;
				instance.type = settings.labels.plural;
				instance.date = new Date();
				instance.save(function (err) {
					if (!err){
						console.log(instance.type);
						res.redirect('admin/'+settings.labels.plural+'/addnew?warning=The '+settings.labels.singular+' was successfully created!');	
					}
					else{
						res.redirect('admin/'+settings.labels.plural+'/addnew?warning=Could not create '+settings.labels.singular+'! Error:'+ err);
					}
				});	
				
			}else {
				res.redirect('admin/'+settings.labels.plural+'/addnew?warning=Missing title!');
			}
	});
	
	/*----------------------------/
		UPDATE
	---------------------------*/
	
	//Edit Post
	app.get('/admin/'+settings.labels.plural+'/edit', ensureAuthenticated, function(req, res){
		postType.findOne({_id: req.query.post_id}, function(err, data){
			console.log(data);
			res.render('editPost', {page: {title: 'Edit '+settings.labels.singular}, post: data});
		});
	});
	
	//Save Edited Post
	app.post('/admin/'+settings.labels.plural+'/edit/save', ensureAuthenticated, function(req, res){
		postType.findOne({_id: req.body.post_id}, function(err, data){
			data.title = req.body.title;
			data.slug = req.body.slug;
			data.content = req.body.content;
			
			data.save(function (err) {
				if (!err){
					res.redirect('admin/'+settings.labels.plural+'/edit?post_id='+req.body.post_id+'&warning=The '+settings.labels.singular+' was successfully updated!');	
				}
				else{
					res.redirect('admin/'+settings.labels.plural+'/edit?post_id='+req.body.post_id+'&warning=Could not save '+settings.labels.singular+'! Error:' + err);
				}
			});	
		});
	});
	
	/*----------------------------/
		READ ROUTES
	---------------------------*/
	
	// Show all Posts
	app.get('/admin/'+settings.labels.plural, ensureAuthenticated, function(req, res){
		getAllPosts(postType, settings.labels.plural, function(data){
			res.render('posts', {page: {title: settings.labels.plural }, blogposts: data});
		});
	});
	
	app.get('/'+settings.slug, function (req, res) {
	    getAllPosts(postType, settings.labels.plural, function(data){
			res.render('blog', {page: {title: settings.labels.plural, header: "Welcome to the a-cms blog. It is super effective at teaching you how to use a-cms" }, blogposts: data});
		});
	});
	
	//Single Post
	app.get('/'+settings.labels.plural+'/:slug', function(req, res){
		getPostBySlug(postType, req.params.slug, function(data){
			res.render('singlepost', {page: data});	
		});
		
	});
}
