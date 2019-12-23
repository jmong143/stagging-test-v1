/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../../config'); 

/* Model */
const User = require('../../models/Users');
const ResetPasswordToken = require('../../models/ResetPasswordToken');

const AuthController = {

	login: async (req, res) => {

		let clientSecret = req.headers['x-client-secret'];
		let user, hash;

		try {
			user = await User.findOne({email: req.body.email}) || {}; 	
			hash = user.password ? await bcrypt.compare(req.body.password, user.password) : false;

			if (!user || !hash) {
				throw new Error('Username/Password is incorrect.')
			} else if(user.isAdmin === true) {	
				throw new Error('Unauthorized')
			} else if (user.isArchive === true) {
				throw new Error('Account deactivated.')
			}

			const JWTToken =  await jwt.sign({
				email: user.email,
				_id: user._id
			},
			clientSecret,
			{
				expiresIn: 43200 
			});
				// 86400 = 24hrs

			await User.findOneAndUpdate(
				{ _id: user._id },
				{ "$set": {
					token: JWTToken
				}}, { "new": true }
			);

			res.status(200).json({
				token: JWTToken,
				user: user,
				expiresIn: new Date(Date.now()+(43200*1000))
			});

		} catch(e) {
			res.status(401).json({
				message: e.message
			});
		}
	},

	adminLogin: async (req, res) => {

		let clientSecret = req.headers['x-client-secret'];
		let user, hash;
		
		try {
			
			user = await User.findOne({email: req.body.email});
			hash = await bcrypt.compare(req.body.password, user.password);

		} finally {
			// Validate if User exists and password is correct.
			if (!user || !hash) {
				res.status(401).json({
					message: 'Username/Password is incorrect.'
				});
			} else if(user.isAdmin === false) {	
				res.status(401).json({
					message: 'Unauthorized.'
				});
			} else if (user && hash) {
				const JWTToken =  await jwt.sign({
					email: user.email,
					_id: user._id
				},
				clientSecret,
				{
					expiresIn: 43200 
				});
					// 86400 = 24hrs
				res.status(200).json({
					token: JWTToken,
					user: user.email,
					expiresIn: new Date(Date.now()+(43200*1000))
				});
			} else {
				res.status(500).json({
					message: 'Someting went wrong'
				});
			}
		}
	},

	logout: function(req, res) {
		// Destroy Token Impossible.
		// Not Functional
	},

	// Register Via APP
	register: async (req, res) => {
		
		let hash, user, validation, saveUser;

		user = await User.findOne({email: req.body.email});
		try {

			validation = await validateField((req.body.email), 'email');
			hash = await bcrypt.hash(req.body.password, 10);

			/* User already exists / Taken Email */
			if(user) 
				throw new Error('Email already taken.');

			const _user = new User({
				_id: new  mongoose.Types.ObjectId(),
				email: req.body.email,
				password: hash,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				subjects: req.body.subjectCode || '',
				isAdmin: false					
			});

			saveUser = await _user.save();
			res.status(200).json({
				result: 'success',
				message: 'New user has been created.',
				data: saveUser
			});
		} catch(e) {
			res.status(500).json({
				result:'failed',
					message: 'Failed to create a new account',
					error: e.message
			});
		}
	},

	// Create Admin Account
	adminRegister: async (req, res) => {

		let hash, user, validation, saveUser;
		user = await User.findOne({email: req.body.email});

		try {

			validation = await validateField((req.body.email), 'email');
			hash = await bcrypt.hash(req.body.password, 10);
			/* User already exists / Taken Email */
			if(user) 
				throw new Error('Email already taken.');

			const _user = new User({
				_id: new  mongoose.Types.ObjectId(),
				email: req.body.email,
				password: hash,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				subjectCode: "N/A",
				isAdmin: true					
			});

			saveUser = await _user.save();
			res.status(200).json({
				result: 'success',
				message: 'New admin user has been created.',
				data: saveUser
			});
		} catch(e) {
			res.status(500).json({
				result:'failed',
					message: 'Failed to create a new admin account',
					error: e.message
			});
		}
	},

	// Change Password 
	changePassword: async (req, res) => {
		
		let token = req.headers['token'];
		let _password = req.body.password;
		let _newPassword = req.body.newPassword;
		let decoded, user, hash, isMatch;

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id });
			isMatch = await bcrypt.compare( _password, user.password);
			hash = await bcrypt.hash( _newPassword, 10);
		} finally {
			if (!decoded || ! user) {
				res.status(401).send({ 
					message: 'Unauthorized' 
				});
			} else if (!isMatch) {
				res.status(400).send({ 
					message: 'Password did not match.' 
				});
			} else if (!hash) {
				res.status(500).json({
					message : "Something went wrong."
				});
			} else {
				await User.findOneAndUpdate(
					{ _id: decoded._id },
					{ "$set": { password: hash }},
					{ "new": true });
				res.status(200).json({
					message: "Password successfuly changed."
				});
			}
		}
	},

	// Reset Password and send link with token to email.
	resetPassword: async (req, res) => {
		let clientId = req.headers['x-client-id'];
		let user, token, sendEmail, saveToken;
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
			user = await User.findOne({email: req.body.email});
		} finally {
			if (!user) {
				res.status(400).json({
					message: "Invalid Email."
				});
			} else {
				token =  await jwt.sign({
					email: user.email,
					_id: user._id
				},
				clientId,
				{
					expiresIn: 86400 
				});

				// Save Token in DB
				const _token = new ResetPasswordToken({
					_id: new mongoose.Types.ObjectId(),
					token: token
				});

				saveToken = await _token.save();

				let mailOptions = {
					from: `Pinnacle Review School <${config.mail.auth.user}>`,  
					to: user.email,
					subject: 'Reset Password - Pinnacle App',
					html: '<p>Please click on the link below to update your password. <br><br>Link: <a>https://pinnaclereviewschool.com/reset-password?expire=' + token + '</a/>'
				};
				sendEmail = await transporter.sendMail(mailOptions);
				
				if (!sendEmail) {
					res.status(200).json({
						message: 'Something went wrong.'
					});
				} else {
					res.status(200).json({
						message: 'An email has been sent to '+ user.email
					});
				}
			}
		} 
	},

	updatePassword: async (req,res) => {
		let clientId = req.headers['x-client-id'];
		let token = req.headers['token'];
		let user, decoded, changePassword, hash, deleteToken, resetPasswordToken;

		try {
			decoded = await jwt.verify(token, config.auth.clients);
			user = await User.findOne({ _id: decoded._id });
			hash = await bcrypt.hash(req.body.newPassword, 10);
		} finally {

			if (!user) {
				res.status(401).json({
					message: "Unauthorized"
				});
			} else if (!hash) {
				res.status(500).json({
					message: "Something went wrong."
				});
			} else {
				changePassword = await User.findOneAndUpdate(
					{ _id: decoded._id },
					{ "$set": {
						password: hash
					}}, { "new": true });
				// Delete Reset password token
				deleteToken = await ResetPasswordToken.deleteOne({ token: token });
				if (changePassword && ( deleteToken.deletedCount > 0))  {
					res.status(200).json({
						message: 'Password successfully updated.'
					});
				} else {
					res.status(500).json({
						message: 'Something went wrong.'
					});
				}
			}
		}
	},
	validateAdminPassword: async (req, res, next) => {
		let clientSecret = req.headers['x-client-secret'];
		let user, hash, decoded;
		let token = req.headers.token;
		
		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id });
			hash = await bcrypt.compare(req.body.password, user.password);

			if (!hash)
				throw new Error('Incorrect password.')
			
			res.status(200).json({
				result: 'success',
				message: 'Admin password succesfully verified.',
				data: true
			});
		} catch (e) {
			res.status(400).json({
				result: 'failed',
				message: e.message,
				data: false
			});
		}
	}
}

function validateField (string, type) {
	return new Promise((resolve, reject) => {
		switch (type.toUpperCase()) {
			case 'EMAIL':
				return string.indexOf('@') > 0 && string.indexOf('.') > 0 ? resolve(true) : reject(new Error('Invalid Email Format'));
				break;
			default:
			return true
		}
	});	
}

module.exports = AuthController;