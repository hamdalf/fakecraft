var express = require('express'),
	router = express.Router(),
	User = require('../models/user');

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

router.route('/user').all(
	function(req, res, next) {
		// do logging
		console.log('userlist start to use');
		next(); // make sure we go to the next routes and don't stop here
	}
).get(function(req, res) {
	User.find(function (err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
}).post(function(req, res) {
	var user = new User();
	user.name = req.body.name;
	user.nick = req.body.nick;
	user.jobTitle = req.body.jobTitle;
	user.pictureUrl = req.body.pictureUrl;
	user.email = req.body.email;
	user.skype = req.body.skype;
	user.mobile = req.body.mobile;
	user.floor = req.body.floor;
	user.location = req.body.location;
	
	user.save(function (err) {
		if (err) {
			res.send(err);
		}
		res.json({message: 'User created!'});
	});
});

module.exports = router;