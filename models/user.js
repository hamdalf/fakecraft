var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	UserSchema = new Schema({
		name: String,
		nick: String,
		jobTitle: String,
		pictureUrl: String,
		email: String,
		skype: String,
		mobile: String,
		floor: Number,
		location: Number
	});
	
module.exports = mongoose.model('userlist', UserSchema);