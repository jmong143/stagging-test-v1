const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

const ProfileController = {

	createProfile: function (req, res) {
		let token = req.headers['token'];
		if (!token){
			return res.status(401).send({ auth: false, message: 'No token provided.' })
		};

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.status(401).send({ 
					auth: false, 
					message: 'Failed to authenticate token.' 
				});
			} else {
				// Validate if user has an existing profile
				Profile.findOne({ userId: decoded._id }).exec(function(err, profile){
					if (profile) {
						res.status(400).json({ message: "Profile Aleady Exists."})
					} else {
						// Save User Profile
						const _profile = new Profile ({
							_id: new mongoose.Types.ObjectId(),
							userId: decoded._id,
							age: req.body.age,
							gender: req.body.gender,
							school: req.body.school,
							subjects: []
						});

						_profile.save().then(function (result) { 
								res.status(200).json({
								message: 'Profile has been created.'
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
		});
	},

	getProfile : function(req, res) {
		// Get Profile + Populate
		let newBody = {};
		let token = req.headers['token'];
		if (!token){
			return res.status(401).send({ auth: false, message: 'No token provided.' })
		};

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.status(500).send({ 
					auth: false, 
					message: 'Failed to authenticate token.' 
				});
			} else {

				Profile.findOne({ userId: decoded._id }).exec(function(err, profile){
					if(!profile)
						res.status(400).json({ message: "Profile not found."})
					else {
						User.findOne({ _id: decoded._id}).exec(function(err,user){
							res.status(200).json({
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email,
								age: profile.age,
								gender: profile.gender,
								school: profile.school,
								subjects: profile.subjects,
								updatedAt: profile.updatedAt || '',
								createdAt: profile.createdAt || ''
							});
						});	
					}
					
				});
			}
		});
	},

	updateProfile: function (req, res) {
		// Update Profile
	},
	
}

module.exports = ProfileController;