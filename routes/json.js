var express = require('express'),
	router = express.Router(),
	path = require("path"),
	fs = require('fs');
	
router.route('/json').all(function(req, res, next) {
	console.log('save json start to use');
	next();
}).get(function(req, res) {
	res.json('Please use POST method fot saving json');
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

router.route('/json/:filename').all(function(req, res, next) {
    console.log('load json start to use');
	next();
}).get(function(req, res) {
    fs.readFile(path.join(__dirname, '../saves/officemap/') + req.params.filename + '.json', function (ex, data) {
        if (ex) {
            return console.log(ex);
        }
        res.json({"d":data.toString()});
    });
}).post(function(req, res) {
    res.json('Please use GET method fot loading json');
});
module.exports = router;