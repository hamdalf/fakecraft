var express = require('express'),
	router = express.Router(),
	path = require("path"),
	fs = require('fs');
	
router.route('/savejson').all(function(req, res, next) {
	console.log('save json start to use');
	next();
}).get(function(req, res) {
	res.json({message: 'Use post method!'});
}).post(function(req, res) {
	var content = req.body.content,
		filename = req.body.filename;
		
	fs.writeFile(path.join(__dirname, '../saves/officemap/') + filename + '.json', content, function(ex) {
		if (ex) {
			return console.log(ex);
		}
		res.json({message: 'File saved!'});
	});
});

module.exports = router;