//Model
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AuthController = {

	login: function(req, res) {

		let clientSecret = req.headers['x-client-secret'];
		User.findOne({email: req.body.email})
		.exec()
		.then(function(user) {
			bcrypt.compare(req.body.password, user.password, function(err, result) {

				if(err) {
					return res.status(401).json({
						failed: 'Unauthorized Access',
						details: err
					});
				}

				if(result){
					const JWTToken = jwt.sign({
						email: user.email,
						_id: user._id
					},
					clientSecret,
					{
						expiresIn: 43200 
					});
						//86400
					return res.status(200).json({
						token: JWTToken,
						user: user.email,
						expiresIn: new Date(Date.now()+(43200*1000))
					});
				}

				return res.status(401).json({
					failed: 'Unauthorized Access'
				});
			});
		})
		.catch(error => {
			res.status(500).json({
				error: {
					'email':req.body.email,
					'errorMessage':'User does not exist.'
				}
			});
		});
	},

	logout: function(req, res) {
		// Destroy Token 
		// Not Functional
	},

	register: function(req, res) {
		bcrypt.hash(req.body.password, 10, function(err, hash){
			if (err) {
				return res.status(400).json({
					error: err
				})
			} else {
				const _user = new User({
					_id: new  mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					subjects: req.body.subjectCode,
					isAdmin: false					
				});
				
				_user.save().then(function (result) {
					res.status(200).json({
						message: 'New user has been created.'
					});
				}, function (err) {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}
		});
	},
	adminRegister: function(req, res) {
		bcrypt.hash(req.body.password, 10, function(err, hash){
			if (err) {
				return res.status(400).json({
					error: err
				})
			} else {
				const _user = new User({
					_id: new  mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					subjectCode: "N/A",
					isAdmin: true					
				});
				
				_user.save().then(function (result) {
					res.status(200).json({
						message: 'New admin user has been created.'
					});
				}, function (err) {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}
		});
	}
}

module.exports = AuthController;