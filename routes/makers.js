var express = require('express'),
	router = express.Router(),
	Maker = require('../models/maker');

/*
*	mongodump -d=officemap
*	mongorestore -d officemap ./[foldername]
*/

/*router.route('/userlist').all(function(req, res, next) {
	// runs for all HTTP verbs first
	// think of it as route specific middleware!
	next();
}).get(function(req, res, next) {
	return req.userModel.find(function (err, docs) {
		//return res.json(docs);
		return res.send(docs);
	});
	next();
}).put(function(req, res, next) {
	next(new Error('not implemented'));
}).post(function(req, res, next) {
	next(new Error('not implemented'));
}).delete(function(req, res, next) {
	next(new Error('not implemented'));
});*/

/*router.use(function(req, res, next) {
    // do logging
    console.log('userlist start to use');
    next(); // make sure we go to the next routes and don't stop here
});*/

router.route('/maker').all(
	function(req, res, next) {
		// do logging
		console.log('makerlist start to use - ', new Date().toString());
		next(); // make sure we go to the next routes and don't stop here
	}
).get(function(req, res) {
	Maker.find().sort('normalized').exec(function (err, makers) {
		if (err) {
			res.send(err);
		}
		res.json(makers);
	});
}).post(function(req, res) {
	var maker = new Maker();
    maker.dataType = req.body.datatype;
	maker.name = req.body.username;
	maker.standno = req.body.standno;
	maker.hall = req.body.hall;
	maker.pictureUrl = req.body.pictureurl;
	maker.infourl = req.body.infourl;
    maker.normalized = req.body.username.toLowerCase()
	
	maker.save(function (err) {
		if (err) {
			console.log(err);
		}
		res.json({message: 'Maker created!'});
	});
});

router.route('/maker/:userid').all(function(req, res, next) {
    console.log('maker by id process started - ', new Date().toString());
	next();
}).get(function(req, res) {
    Maker.find({_id: req.params.userid}, function (err, makers) {
        if (err) {
			res.send(err);
		} else {
		    res.json(makers);
        }
    });
}).put(function(req, res) {
    var dataToBe = {
        dataType: req.body.datatype,
		name: req.body.username,
		standno: req.body.standno,
		hall: req.body.hall,
		pictureUrl: req.body.pictureurl,
		infourl: req.body.infourl,
        normalized: req.body.username.toLowerCase()
	};
    Maker.update({_id: req.params.userid}, dataToBe, function (err, makers) {
        if (err) {
			console.log(err);
		}
		res.json({message: 'Maker updated!'});
    });
}).delete(function(req, res) {
    Maker.remove({_id: req.params.userid}, function(err) {
        if (err) {
			console.log(err);
		}
		res.json({message: 'Maker deleted!'});
    });
});


module.exports = router;