/* Dependencies */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

/* Config */
const config = require('../../config'); 

/* Models */
const User = require('../../models/Users');
const Profile = require('../../models/Profile');

/* Controllers */
const AuditTrail = require('./AuditTrailController');

const tag = 'User Management';

const UserController =  {

	getUsers: async (req, res) => {

		// Search + filters
		let keyword = req.query.keyword;
		let isAdmin = req.query.isAdmin;
		let query = [{ $match: {isActive: true} }];
		let Users;
		if (isAdmin) {
			query.push({ $match: { isAdmin: !!isAdmin }});
		}
		if (keyword) {
			query.push( {$match:{ $or: [
					{"firstName": {'$regex': '^'+keyword, '$options' : 'i'}},
					{"lastName":{'$regex': '^'+ keyword, '$options' : 'i'}},
					{"email": {'$regex': '^'+keyword, '$options' : 'i'}}
				]} 
			});
		}

		// Pagination:
		let count = 0;
		let pageItems = parseInt(config.pagination.defaultItemsPerPage);
		let pageNumber = 1;

		let newBody = {
			pageNumber: 0,
			totalPages: 0,
			itemsPerPage: 0,
			totalItems: 0,
			items: [],
		}

		if (req.query.pageNumber) {
			pageNumber = parseInt(req.query.pageNumber);
		}

		if (req.query.pageItems) {
			pageItems = parseInt(req.query.pageItems);

		}

		try {

			count = await User.aggregate(query);
			count = count.length;
			Users = await User.aggregate(query).skip(pageItems*(pageNumber-1)).limit(pageItems);
			newBody.pageNumber = parseInt(pageNumber);
            newBody.totalPages = Math.ceil(count / pageItems);
            newBody.itemsPerPage = pageItems;
            newBody.totalItems = count;

            Users.forEach((user)=> {
            	newBody.items.push({
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					subjectCode: user.subjectCode,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					isArchive: user.isArchive,
					isAdmin: user.isAdmin,
					isSuperAdmin: user.isSuperAdmin || false,
					isActive: user.isActive
				});
            });

            res.status(200).json({
            	result: 'success',
            	message: 'Successfully get user list',
            	data: newBody
            });
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get list of users',
				error: e.message
			});
		}
		
	},

	getUser: async (req, res) => {

		let user, profile = {};

		try {
			user = await User.findOne({ _id: req.params.userId });
			if (user.isAdmin === false) {
				profile = await Profile.findOne({ userId: req.params.userId }) || {};
			}
			res.status(200).json({
				result: 'success',
				message: 'Successfully get user details.',
				data:{
					id: user._id,
					firstName: user.firstName,
					middleName: user.middleName,
					lastName: user.lastName,
					email: user.email,
					birthDate: profile.birthDate || '',
					gender: profile.gender || '',
					school: profile.school || '',
					subjectCode: user.subjectCode || '',
					updatedAt: user.updatedAt || '',
					createdAt: user.createdAt || '',
					isActive: user.isActive || '',
					isArchive: user.isArchive,
					isAdmin: user.isAdmin,
					isSuperAdmin: user.isSuperAdmin || false
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Something went wrong.',
				error: e.message
			});
		}
	},

	createUser: async (req, res) => {
		const action = 'Create User';
		let _password = Math.random().toString(36).substr(2, 10).toUpperCase();
		let hash, user, saveUser, sendMail;

		let transporter = nodemailer.createTransport({
		    host: config.mail.host,
		    secureConnection: config.mail.secureConnection,
		    port: config.mail.port,
		    auth: {
		        user: config.mail.auth.user,
		        pass: config.mail.auth.password
		    }
		});

		try {
			hash = await bcrypt.hash(_password,10);
			user = await User.findOne( { email: req.body.email } );
		} finally {
			if (!hash) {
				res.status(500).json({
					result: 'failed',
					message: 'Something went wrong.'
				});
			} else if (user) {
				res.status(400).json({
					result: 'failed',
					message: 'Email already taken.'
				});
			} else if (!user && hash) {
				let _user = new User({
					_id: new mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					middleName: req.body.middleName,
					lastName: req.body.lastName,
					subjectCode: req.body.subjectCode,
					isArchive: false,
					isActive: true,
					isAdmin: req.body.isAdmin || false,
					isSuperAdmin: false,
					createdAt: Date.now(),
					updatedAt: Date.now()					
				});

				saveUser = await _user.save();
				if (!saveUser) {
					res.status(500).json({
						result: 'failed',
						message: 'User saving failed.'
					});
				} else {
					let mailOptions = {
						from: `Pinnacle Review School <${config.mail.auth.user}>`,  
						to: saveUser.email,
						subject: 'Pinnacle App Account Registration',
						html: '<p>Congratulations! Your Account has been created. <br><br>Temporary Password : ' + _password + '<br><br>Please Change your password using the link below.<br></p>'
					};
					sendMail = await transporter.sendMail(mailOptions);
					if (sendMail) {
						console.log('Email has been sent to '+ saveUser.email);
						res.status(200).json({
							result: 'success',
							message: 'New user has been created. An Email has been sent to '+ req.body.email,
							data: saveUser
						});
						let log = {
							module: tag,
							action: action,
							details: {
								email: saveUser.email
							}
						};
						AuditTrail.addAuditTrail(log, req.headers.token);

					} else {
						res.status(500).json({
							result: 'failed',
							message: 'Email sending failed.'
						});
					}
				}
			}
		}
	},

	deleteUser: async (req, res) => {
		// Deactivate User (Archive)
		const action = 'Archive User';
		let user, archiveUser;
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					result: 'failed',
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
					result: 'success',
					message: 'User successfuly archived.',
					data: archiveUser
				});	

				let log = {
					module: tag,
					action: action,
					details: {
						email: archiveUser.email
					}
				};

				AuditTrail.addAuditTrail(log, req.headers.token);
			}		
		}
	},

	reactivateUser: async (req,res) => {
		// Re activate User account (Unarchive)
		let user, activateUser;
		const action = 'Reactivate User';
		try {
			user = await User.findOne({_id: req.params.userId});
		} finally {
			if (!user) {
				res.status(200).json({
					result: 'failed',
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
					result: 'success',
					message: 'User account successfuly reactivated.',
					data: activateUser
				});	

				let log = {
					module: tag,
					action: action,
					details: {
						email: activateUser.email
					}
				};

				AuditTrail.addAuditTrail(log, req.headers.token);
			}		
		}
	},

	updateUser: async (req, res) => {
		// update user detials
		const action = 'Update User';
		let user, updateUser, updateProfile, hash, profile;
		try {
			user = await User.findOne({ _id: req.params.userId });
			profile = await Profile.findOne({ userId: user._id });

			let userBody = {
				updatedAt: Date.now()
			};

			req.body.email ? userBody.email = req.body.email : '';
			req.body.firstName ? userBody.firstName = req.body.firstName : '';
			req.body.middleName ? userBody.middleName = req.body.middleName : '';
			req.body.lastName ? userBody.lastName = req.body.lastName : '';
			req.body.subjectCode ? userBody.subjectCode = req.body.subjectCode : '';

			// If Change Password:
			if (req.body.password) {
				hash = await bcrypt.hash(req.body.password,10);
				userBody.password = hash
			}


			let profileBody = {
				updatedAt: Date.now()
			}

			req.body.birthDate ? profileBody.birthDate = req.body.birthDate : '';
			req.body.gender ? profileBody.gender = req.body.gender : '';
			req.body.school ? profileBody.school = req.body.school : '';

			updateUser = await User.findOneAndUpdate(
				{ _id : user._id },
				{ $set: userBody },
				{ new: true }
			);

			if(profile) {
				updateProfile = await Profile.findOneAndUpdate(
					{ userId: req.params.userId },
					{ $set: profileBody },
					{ new: true}
				);	
			} else {
				!req.body.birthDate ? profileBody.birthDate = Date.now() : '';
				!req.body.gender ? profileBody.gender = '' : '';
				!req.body.school ?  profileBody.school ='' : '';
				profileBody.userId = user._id;
				profileBody._id = new mongoose.Types.ObjectId();
				let newProfile = new Profile(profileBody);
				updateProfile = await newProfile.save();
			}
			

			res.status(200).json({
				result: 'success',
				message: 'User Details successfuly updated.',
				data: {
					email: updateUser.email,
					firstName: updateUser.firstName,
					middleName: updateUser. middleName,
					lastName: updateUser.lastName,
					subjectCode: updateUser.subjectCode,
					birthDate: updateProfile.birthDate || '',
					gender: updateProfile.gender || '',
					school: updateProfile.school || '',
					updatedAt: updateUser.updatedAt
				}
			});

			let log = {
				module: tag,
				action: action,
				details: {
					email: updateUser.email
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch (e) {
			throw e
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update user details',
				error: e.message
			});
		}
	},

	createSuperUser: async (req, res, next) => {
		let _password = Math.random().toString(36).substr(2, 10).toUpperCase();
		let superPassword = config.superAdminPassword;

		let hash, user, saveUser, sendMail, superUsers, superUser;

		let transporter = nodemailer.createTransport({
		    host: config.mail.host,
		    secureConnection: config.mail.secureConnection,
		    port: config.mail.port,
		    auth: {
		        user: config.mail.auth.user,
		        pass: config.mail.auth.password
		    }
		});

			user = await User.findOne( { email: req.body.email } );
		try {
			/* Validate Super Password */
			if (superPassword != req.body.key )
				throw new Error('Incorrect Key.')
			/* If email taken*/
			if(user)
				throw new Error ('Email already taken.');
			
			/* Get Existing Super Users*/
			superUsers = await User.find({ isSuperAdmin: true });

			/* Check super user count*/
			if(superUsers.length >= parseInt(config.superAdminCount))
				throw new Error ('The number of super users has been exceeded. ('+superUsers.length+')');

			/* generate password*/
			hash = await bcrypt.hash(_password,10);

			superUser = new User({
				_id: new mongoose.Types.ObjectId(),
				email: req.body.email,
				password: hash,
				firstName: req.body.firstName,
				middleName: req.body.middleName,
				lastName: req.body.lastName,
				subjectCode: '',
				isArchive: false,
				isActive: true,
				isAdmin: true,
				isSuperAdmin: true,
				createdAt: Date.now(),
				updatedAt: Date.now()					
			});

			saveUser = await superUser.save().then(async (result)=> {
				/*Send Email*/
				let mailOptions = {
					from: `Pinnacle Review School <${config.mail.auth.user}>`,  
					to: result.email,
					subject: 'Pinnacle App Administrator Creation',
					html: '<p>Congratulations! Your Account has been created. <br><br>Temporary Password : ' + _password + '<br><br>Please Change your password using the administrator website.<br></p>'
				};
				sendMail = await transporter.sendMail(mailOptions);
			});

			res.status(200).json({
				result: 'success',
				message: 'Super User has been successfully created.',
				data: saveUser
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create super user.',
				error: e.message
			});
		}
	}
}

module.exports = UserController;