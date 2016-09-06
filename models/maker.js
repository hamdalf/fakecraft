var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	MakerSchema = new Schema({
        dataType: String,
		name: String,
		standno: String,
		hall: String,
		pictureUrl: String,
		infourl: String,
        normalized: String
	});
	
module.exports = mongoose.model('makerlist', MakerSchema);