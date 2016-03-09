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
		console.log('userlist start to use - ', new Date().toString());
		next(); // make sure we go to the next routes and don't stop here
	}
).get(function(req, res) {
	User.find().sort('normalized').exec(function (err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
}).post(function(req, res) {
	var user = new User();
    user.dataType = req.body.datatype;
	user.name = req.body.username;
	user.nick = req.body.nickname;
	user.jobTitle = req.body.jobtitle;
	user.pictureUrl = req.body.pictureurl;
	user.email = req.body.email;
	user.skype = req.body.skype;
	user.mobile = req.body.mobile;
	user.floor = req.body.floor;
	user.location = req.body.location;
    user.normalized = req.body.username.toLowerCase()
	
	user.save(function (err) {
		if (err) {
			console.log(err);
		}
		res.json({message: 'User created!'});
	});
});

router.route('/user/:userid').all(function(req, res, next) {
    console.log('user by id process started - ', new Date().toString());
	next();
}).get(function(req, res) {
    User.find({_id: req.params.userid}, function (err, users) {
        if (err) {
			res.send(err);
		} else {
		    res.json(users);
        }
    });
}).put(function(req, res) {
    var dataToBe = {
        dataType: req.body.datatype,
		name: req.body.username,
		nick: req.body.nickname,
		jobTitle: req.body.jobtitle,
		pictureUrl: req.body.pictureurl,
		email: req.body.email,
		skype: req.body.skype,
		mobile: req.body.mobile,
		floor: req.body.floor,
		location: req.body.location,
        normalized: req.body.username.toLowerCase()
	};
    User.update({_id: req.params.userid}, dataToBe, function (err, users) {
        if (err) {
			console.log(err);
		}
		res.json({message: 'User updated!'});
    });
}).delete(function(req, res) {
    User.remove({_id: req.params.userid}, function(err) {
        if (err) {
			console.log(err);
		}
		res.json({message: 'User deleted!'});
    });
});


module.exports = router;