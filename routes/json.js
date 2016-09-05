var express = require('express'),
	router = express.Router(),
	path = require("path"),
	fs = require('fs');
	
router.route('/json').all(function(req, res, next) {
	console.log('save json start to use');
	next();
}).get(function(req, res) {
	console.log('Please use POST method fot saving json');
}).post(function(req, res) {
	var content = req.body.content,
		filename = req.body.filename;
		
	fs.writeFile(path.join(__dirname, '../saves/officemap/') + filename + '.json', content, function(ex) {
		if (ex) {
			console.log(ex);
		}
		res.json({message: 'File saved!'});
        res.end();
	});
});

router.route('/json/:filename').all(function(req, res, next) {
    console.log('load json start to use - ', new Date().toString());
	next();
}).get(function(req, res) {
    fs.readFile(path.join(__dirname, '../saves/officemap/') + req.params.filename + '.json', function (ex, data) {
        if (ex) {
            console.log(ex);
        }
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(data);
        res.end();
    });
}).post(function(req, res) {
    console.log('Please use GET method fot loading json');
});

router.route('/json2').all(function(req, res, next) {
	console.log('save json start to use');
	next();
}).get(function(req, res) {
	console.log('Please use POST method fot saving json');
}).post(function(req, res) {
	var content = req.body.content,
		filename = req.body.filename;
		
	fs.writeFile(path.join(__dirname, '../saves/indoor/') + filename + '.json', content, function(ex) {
		if (ex) {
			console.log(ex);
		}
		res.json({message: 'File saved!'});
        res.end();
	});
});

router.route('/files/:position').all(function(req, res, next) {
	console.log('load file list start to use');
	next();
}).get(function(req, res) {
	var folder;

	switch (req.params.position) {
		case 'indoor':
			folder = path.join(__dirname, '../saves/indoor/');
			break;
		case 'office':
			folder = path.join(__dirname, '../saves/officemap/');
			break;
	}

	var files = fs.readdirSync(folder);
	res.json(files);
}).post(function(req, res) {
    console.log('Please use GET method for file list');
});

router.route('/file').all(function(req, res, next) {
    console.log('save file start to use - ', new Date().toString());
	next();
}).get(function(req, res) {
	console.log('Please use POST method fot saving json');
}).post(function(req, res) {
	var content = req.body.content,
		position = req.body.position,
		filename = req.body.filename,
		folder;

	switch (position) {
		case 'indoor':
			folder = path.join(__dirname, '../saves/indoor/');
			break;
		case 'office':
			folder = path.join(__dirname, '../saves/officemap/');
			break;
	}
		
	fs.writeFile(folder + filename + '.json', content, function(ex) {
		if (ex) {
			console.log(ex);
		}
		res.json({message: 'File saved!'});
        res.end();
	});
});

router.route('/file/:position/:filename').all(function(req, res, next) {
    console.log('load file start to use - ', new Date().toString());
	next();
}).get(function(req, res) {
	var folder;

	switch (req.params.position) {
		case 'indoor':
			folder = path.join(__dirname, '../saves/indoor/');
			break;
		case 'office':
			folder = path.join(__dirname, '../saves/officemap/');
			break;
	}

    fs.readFile(folder + req.params.filename + '.json', function (ex, data) {
        if (ex) {
            console.log(ex);
        }
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(data);
        res.end();
    });
}).post(function(req, res) {
    console.log('Please use GET method fot loading json');
});

module.exports = router;