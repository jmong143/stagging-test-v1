const User = require('../../models/Users');
const Profile = require('../../models/Profile');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserController = {

	getUsers: function(req, res) {
		// Query Params to follow & pagination
		User.find({ isAdmin: false }).exec(function(err, users) {
			let newBody = {
				users: [],
				total: users.length
			};
			users.forEach((user)=>{
				newBody.users.push({
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					subjectCode: user.subjectCode,
					createdAt: user.createdAt
				});
			});
			res.status(200).json(newBody);
		});
	},

	getUser: function (req, res) {
		Profile.findOne({ userId: req.params.userId }).exec(function(err, profile){
			let _profile = {};
			if (!profile) {
				profile = _profile;
			}			
			User.findOne({ _id: req.params.userId}).exec(function(err,user){
				res.status(200).json({
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					age: profile.age || '',
					gender: profile.gender || '',
					school: profile.school || '',
					subjects: profile.subjects || '',
					updatedAt: profile.updatedAt || '',
					createdAt: user.createdAt || ''
				});
			});		
		});	
	},

	createUser: function (req, res) {
		bcrypt.hash(req.body.password, 10, function(err, hash){
			if (err) {
				return res.status(400).json({
					error: err
				})
			} else {
				const _user = new User({
					_id: new mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					subjectCode: req.body.subjectCode,
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

	addSubjectCode: function (req, res) {
		// Add subject code for a user
	},

	deleteUser: function(req, res) {
		// Delete User
	}	
}

module.exports = UserController;