const User = require('../../models/Users');
const Profile = require('../../models/Profile');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const UserController = {

	getUsers: function(req, res) {
		// Query Params to follow & pagination

		let keyword = req.query.keyword;
		let query = [{ $match: {isAdmin: false} }];

		if (keyword) {
			query.push( {$match:{ $or: [
					{"firstName": {'$regex': '^'+keyword, '$options' : 'i'}},
					{"lastName":{'$regex': '^'+ keyword, '$options' : 'i'}},
					{"email": {'$regex': '^'+keyword, '$options' : 'i'}}
				]} 
			});s
		}
		User.aggregate(query).exec(function(err, users) {
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
					createdAt: user.createdAt || '',
					isActive: user.isActive || ''
				});
			});		
		});	
	},

	createUser: function (req, res) {
		let _password = Math.random().toString(36).substr(2, 10).toUpperCase();
		bcrypt.hash(_password, 10, function(err, hash){
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
					// Mail the password to the email
					transporter = nodemailer.createTransport({
					    service: 'Gmail',
					    auth: {
					        user: 'pinnaclereviewschool@gmail.com',
					        pass: 'P1nn@cl3'
					    }
					});
					let mailOptions = {
						from: '"Pinnacle Review School" <bulawanjp@gmail.com>',  
						to: result.email,
						subject: 'Pinnacle App Account Registration',
						html: '<p>Congratulations! Your Account has been created. <br><br>Temporary Password : ' + _password + '<br><br>Please Change your password using the link below.<br></p>'
					};
					transporter.sendMail(mailOptions, function(error, info){
						if(error){
							return console.log(error);
						} else {
							console.log('Message sent: ' + info.response+ 'password: '+_password);
							res.status(200).json({
								message: 'New user has been created.'
							});
						} 
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

	activateSubjectCode: function (req, res) {
		// Activate subject code for a user
	},

	deactivateUser: function(req, res) {
		// Delete User
	}	
}

module.exports = UserController;