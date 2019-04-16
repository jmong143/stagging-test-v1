/* Dependencies */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

/*Models*/
const User = require('../../models/Users');
const Profile = require('../../models/Profile');

const UserController = {

	getUsers: (req, res) => {
		// Query Params to follow & pagination

		let keyword = req.query.keyword;
		let query = [{ $match: {isAdmin: false} }];

		if (keyword) {
			query.push( {$match:{ $or: [
					{"firstName": {'$regex': '^'+keyword, '$options' : 'i'}},
					{"lastName":{'$regex': '^'+ keyword, '$options' : 'i'}},
					{"email": {'$regex': '^'+keyword, '$options' : 'i'}}
				]} 
			});
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
					createdAt: user.createdAt,
					isArchive: user.isArchive
				});
			});
			res.status(200).json(newBody);
		});
	},

	getUser: (req, res) => {

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
					subjectCode: user.subjectCode || '',
					updatedAt: profile.updatedAt || '',
					createdAt: user.createdAt || '',
					isActive: user.isActive || '',
					isArchive: user.isArchive
				});
			});		
		});	
	},

	createUser: async (req, res) => {
		let _password = Math.random().toString(36).substr(2, 10).toUpperCase();
		let hash, user, saveUser, sendMail;
		let transporter = nodemailer.createTransport({
		    service: 'Gmail',
		    auth: {
		        user: 'pinnaclereviewschool@gmail.com',
		        pass: 'P1nn@cl3'
		    }
		});
		try {
			hash = await bcrypt.hash(_password,10);
			user = await User.findOne( { email: req.body.email } );
		} finally {
			if (!hash) {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			} else if (user) {
				res.status(400).json({
					message: 'Email already taken.'
				});
			} else if (!user && hash) {
				let _user = new User({
					_id: new mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					subjectCode: req.body.subjectCode,
					isArchive: false,
					isActive: true,
					isAdmin: false					
				});

				saveUser = await _user.save();
				if (!saveUser) {
					res.status(500).json({
						message: 'Something went wrong.'
					});
				} else {
					let mailOptions = {
						from: '"Pinnacle Review School" <pinnaclereviewschool@gmail.com>',  
						to: saveUser.email,
						subject: 'Pinnacle App Account Registration',
						html: '<p>Congratulations! Your Account has been created. <br><br>Temporary Password : ' + _password + '<br><br>Please Change your password using the link below.<br></p>'
					};
					sendMail = await transporter.sendMail(mailOptions);
					console.log('Email has been sent to '+ saveUser.email);
					res.status(200).json({
						message: 'New user has been created. An Email has been sent to .'+ req.body.email
					});
				}
			}
		}
	},

	deleteUser: async (req, res) => {
		// Deactivate User (Archive)
		let user, archiveUser;
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					message: 'User does not exist.'
				});
			} else {
				archiveUser = await User.findOneAndUpdate(
					{ _id: req.params.userId },
					{ $set: {
						isActive: false,
						isArchive: true,
					}},
					{ new: true }
				);				
				res.status(200).json({
					message: 'User successfuly archived.'
				});	
			}		
		}
	},

	reactivateUser: async (req,res) => {
		// Re activate User account (Unarchive)
		let user, activateUser;
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					message: 'User does not exist.'
				});
			} else {
				activateUser = await User.findOneAndUpdate(
					{ _id: req.params.userId },
					{ $set: {
						isActive: false,
						isArchive: false,
					}},
					{ new: true }
				);				
				res.status(200).json({
					message: 'User account successfuly reactivated.'
				});	
			}		
		}
	}
}

module.exports = UserController;