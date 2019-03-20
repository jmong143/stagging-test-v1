//Model
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../../config').auth; 

const AuthController = {

	login: function(req, res) {

		let clientSecret = req.headers['x-client-secret'];
		User.findOne({email: req.body.email})
		.exec()
		.then(function(user) {
			if(user.isAdmin === false) {
				bcrypt.compare(req.body.password, user.password, function(err, result) {
					
					if(err) {
						return res.status(401).json({
							message: 'Username/Password is incorrect.'
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
						message: 'Username/Password is incorrect.'
					});
				});
			} else {
				res.status(401).json({
					message: 'Unauthorized'
				});
			}
		})
		.catch(error => {
			res.status(401).json({
					message: 'Unauthorized'
			});
		});
	},

	adminLogin: function(req, res) {

		let clientSecret = req.headers['x-client-secret'];
		User.findOne({email: req.body.email})
		.exec()
		.then(function(user) {
			if(user.isAdmin === true) {
				bcrypt.compare(req.body.password, user.password, function(err, result) {
					if(err) {
						return res.status(401).json({
							message: 'Username/Password is incorrect.'
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
							user: {
								email: user.email,
								firstName: user.firstName,
								lastName: user.lastName
							},
							expiresIn: new Date(Date.now()+(43200*1000))
						});
					}

					return res.status(401).json({
						message: 'Username/Password is incorrect.'
					});
				});
			} else {
				res.status(401).json({
					message: 'Unauthorized'
				});
			}		
		})
		.catch(error => {
			res.status(401).json({
				message: 'Unauthorized'	
			});
		});
	},

	logout: function(req, res) {
		// Destroy Token Impossible.
		// Not Functional
	},

	// Register Via APP
	register: function(req, res) {
		bcrypt.hash(req.body.password, 10, function(err, hash){
			if (err) {
				return res.status(500).json({
					message: 'Internal Server Error'
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
						message: 'Email address already taken.'
					});
				});
			}
		});
	},

	// Create Admin Account
	adminRegister: function(req, res) {
		bcrypt.hash(req.body.password, 10, function(err, hash){
			if (err) {
				return res.status(500).json({
					message: 'Internal Server Error'
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
					res.status(401).json({
						message: 'Email address already taken.'
					});
				});
			}
		});
	},

	// Change Password 
	changePassword: function (req, res) {
		let token = req.headers['token'];
		let _password = req.body.password;
		let _newPassword = req.body.newPassword;

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.status(401).send({ 
					message: 'Unauthorized' 
				});
			} else {
				User.findOne({ _id: decoded._id }).exec(function(err, result){
					bcrypt.compare( _password, result.password, function (err, result){
						// console.log(result);
						if (!result) {
							res.status(400).json({
								message: "Password is incorrect."
							});
						} else {
							bcrypt.hash( _newPassword, 10, function(err, hash){
								if (err){
									return res.status(500).json({
										message: 'Someting went wrong.'
									})
								} else {
									User.findOneAndUpdate(
										{ _id: decoded._id },
										{ "$set": { password: hash }},
										{ "new": true },
										function(err, result) {
											if (err) {
												res.status(500).json({
													message : "Something went wrong."
												});
											} else {
												res.status(200).json({
													message: "Password successfuly changed."
												});
											}
									});
								}
							}); 
						}
					});	
				});		
			}
		});
	},
	// Reset Password and send to new password to email.
	resetPassword: function (req, res) {
	
	}
}

module.exports = AuthController;