var users = {
	'admin' : {user: 'admin', password: 'admin', role: 'admin'},
	'user' : {user: 'user', password: 'user', role: 'user'}
}

module.exports.authenticate = function(user, password, callback) {
	var user = users[user];
	if(!user){
		callback(null);
		return;
	}
	if (user.password == password) {
		callback(user);
		return;
	}
	callback(null);
}