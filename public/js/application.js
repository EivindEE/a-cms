$(document).ready(function(){
			
			$('.redactor').redactor();
			
			
			
			
			//Title to URL
			function prettyUrl(title){
				// alert(title); // debug
			
				// Clean up the title		
				var url = title
					.toLowerCase() // change everything to lowercase
					.replace(/^\s+|\s+$/g, "") // trim leading and trailing spaces		
					.replace(/[_|\s]+/g, "-") // change all spaces and underscores to a hyphen
					.replace(/[^a-z0-9-]+/g, "") // remove all non-alphanumeric characters except the hyphen
					.replace(/[-]+/g, "-") // replace multiple instances of the hyphen with a single instance
					.replace(/^-+|-+$/g, "") // trim leading and trailing hyphens				
					; 
				
				return url;
			}
			
			
			$('input#title').change(function() {
			  var slug = $(this).attr('value');
			  $('#slug input').val(prettyUrl(slug));
			});
		
});