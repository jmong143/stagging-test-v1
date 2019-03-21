const Profile = require('../../models/Profile');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

const ProfileController = {

	createProfile: function (req, res) {
		let token = req.headers['token'];

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

	getProfile : async (req, res) => {
		// Get Profile

		let token = req.headers['token'];
		
		try {

			const decoded = await jwt.verify(token, config.secret);
			const user = await User.findOne({ _id: decoded._id });
			const profile = await Profile.findOne({ userId: decoded._id});
			const subjectCode = await SubjectCode.findOne({ userId: decoded._id});

			res.status(200).json({
				user: {
					id: user._id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					age: profile.age,
					gender: profile.gender,
					school: profile.school,
					updatedAt: profile.updatedAt,
				},
				subjects: {
					subjectCode: subjectCode.subjectCode,
					list: subjectCode.subjects,
					activatedAt: subjectCode.activatedAt,
					expiresAt: subjectCode.expiresAt
				}
			});

		} catch(e) {
			res.status(500).json({
				message: 'Profile not found.'
			});
		}
	},

	updateProfile: async (req, res) => {
		// Update Profile
		let token = req.headers['token'];

		try {
			
			const decoded = await jwt.verify(token, config.secret);
			const updateProfile = await Profile.findOneAndUpdate(
				{ userId: decoded._id },
				{ "$set": {
					age: req.body.age,
					gender: req.body.gender,
					school: req.body.school,
					updatedAt: Date.now()
				}},{ "new": true });
		
			res.status(200).json({
				message: 'Profile successfuly updated.'
			});

		} catch(e) {
			res.status(500).json({
				message: 'Profile not found'
			});
		}
	},	
}

module.exports = ProfileController;