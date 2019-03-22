/* Model Required */
const User = require('../../models/Users');

/* Dependencies Required */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../../config').auth; 

const AuthController = {

	login: async (req, res) => {

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
			}else if(user.isAdmin === true) {	
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
		
		let hash, user;

		try {
			user = await User.findOne({email: req.body.email});
			hash = await bcrypt.hash(req.body.password, 10);
		} finally {

			if(user) {
				res.status(400).json({
					message: 'Email already taken.'
				});
			} else if(!hash) {
				res.status(500).json({
					message: 'Internal Server Error'
				});
			} else {
				const _user = new User({
					_id: new  mongoose.Types.ObjectId(),
					email: req.body.email,
					password: hash,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					subjects: req.body.subjectCode || '',
					isAdmin: false					
				});

				await _user.save();
				res.status(200).json({
					message: 'New user has been created.'
				});
			}
		}
	},

	// Create Admin Account
	adminRegister: async (req, res) => {

		let hash, user;

		try {
			user = await User.findOne({email: req.body.email});
			hash = await bcrypt.hash(req.body.password, 10);
		} finally {
			if(user) {
				res.status(400).json({
					message: 'Email already taken.'
				});
			} else if(!hash) {
				res.status(500).json({
					message: 'Internal Server Error'
				});
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

				await _user.save();
				res.status(200).json({
					message: 'New admin user has been created.'
				});
			}
		}
	},

	// Change Password 
	changePassword: async (req, res) => {
		
		let token = req.headers['token'];
		let _password = req.body.password;
		let _newPassword = req.body.newPassword;
		let decoded, user, hash, isMatch;

		try {
			decoded = await jwt.verify(token, config.secret);
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

	// Reset Password and send to new password to email.
	resetPassword: function (req, res) {
	
	}
}

module.exports = AuthController;