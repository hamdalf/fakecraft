var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	UserSchema = new Schema({
        dataType: String,
		name: String,
		nick: String,
		jobTitle: String,
		pictureUrl: String,
		email: String,
		skype: String,
		mobile: String,
		floor: String,
		location: String,
        normalized: String
	});
	
module.exports = mongoose.model('userlist', UserSchema);