/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../../config'); 

/* Models */
const User = require('../../models/Users');
const ActivityController = require('./ActivityController');
const Subject = require('../../models/Subject');
const SubjectCode = require('../../models/SubjectCode');

const tag = 'Subscription';

const SubjectController = {

	generateSubjectCode: async (req, res) => {

		let subjectCode = Math.random().toString(36).substr(2, 8).toUpperCase();
		let _subjects = [];
		let subjects;
		let list = {};

		try {
			subjects = await Subject.find();
			if(subjects) {
				subjects.forEach((subject) => {
					list[subject._id] = subject.name
				});
			}

			if(req.body.subjects.length < 1) {
				res.status(500).json({
					message: 'Atleast 1 subject is required.'
				});
			} else {
				req.body.subjects.forEach((subject)=>{
					_subjects.push({
						subjectId: subject,
						name: list[subject] || '',
						progress: 0
					});
				});	
			}

			const _subjectCode = new SubjectCode ({
				_id: new mongoose.Types.ObjectId(),
				subjectCode: subjectCode,
				subjects: _subjects
			});

			const result = await _subjectCode.save(); 
			res.status(200).json({
				message: 'Subject Code has been generated.',
				id: result._id,
				subjectCode: result.subjectCode,
				subjects: result.subjects
			});
		}	catch (e) {
			res.status(500).json({
				message: 'Failed to generate subject code.'
			});
		}	
	},

	getSubjectCodes: async (req, res) => {

		let subjectCodes;
		let newBody = {
			list: [],
			total: 0
		};

		try {
			subjectCodes = await SubjectCode.find();
		} finally {
			if (!subjectCodes) {
				res.status(200).json(newBody);
			} else if (subjectCodes.length > 0) {
				subjectCodes.forEach((subjectCode)=>{
					newBody.list.push({
						id: subjectCode._id,
						subjectCode: subjectCode.subjectCode,
						userId: subjectCode.userId || '',
						subjects: subjectCode.subjects
					});
				});
				newBody.total = subjectCodes.length;
				res.status(200).json(newBody);
			}		
		}
	},

	getSubjectCode: async (req, res) => {
		let subjectCode;
		try {
			subjectCode = await SubjectCode.findOne({ _id: req.params.subjectCodeId });
		} finally {
			if(!subjectCode) {
				res.status(400).json({
					message: 'Subject code does not exist.'
				});
			} else {
				res.status(200).json({
					id: subjectCode._id,
					subjectCode: subjectCode.subjectCode,
					userId: subjectCode.userId || '',
					createdAt: subjectCode.createdAt,
					activatedAt: subjectCode.activatedAt || '',
					expiresAt: subjectCode.expiresAt || '',
					subjects: subjectCode.subjects
				});
			}
		}
	},

	getSubscription: async (req, res) => {
		let token = req.headers['token'];
		let decoded, user, subjectCode, newBody;
		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}); 
		} finally {
			if (!decoded || !user) {
				res.status(401).json({ 
					message: 'Unauthorized.' 
				});		
			} else if (!subjectCode) {
				res.status(400).json({ 
					message: 'You are currently unsubscribed. Please activate a subject code.' 
				});	
			} else {
				newBody = {
					id: subjectCode._id,
					subjectCode: subjectCode.subjectCode,
					userId: subjectCode.userId,
					subjects: subjectCode.subjects,
					createdAt: subjectCode.createdAt,
					activatedAt: subjectCode.activatedAt,
					expiresAt: subjectCode.expiresAt					
				};
				res.status(200).json(newBody);
			}	
		}
	},

	activateSubjectCode: async (req, res) => {
		let token = req.headers['token'];
		let decoded, user, subjectCode, userResult, subjectCodeResult;

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: req.body.subjectCode});
			
		} finally {
			// Validate User
			if (!user || !decoded) {
				res.status(401).json({ 
					message: 'Unauthorized.' 
				});	
			// Validate if user has a subject code
			} else if (user.subjectCode) {
				res.status(400).json({ 
					message: 'You already have a subject code.' 
				});
			// Validate if subject code exists
			} else if (!subjectCode) {
				res.status(400).json({ 
					message: 'Subject code does not exist.' 
				});
			// Validate if subject code is already used
			} else if (subjectCode.userId) {
				res.status(400).json({ 
					message: 'Subject code already used.' 
				});
			// Activate Subject Code
			} else if (!subjectCode.userId && !user.subjectCode){

				userResult = await User.findOneAndUpdate({ _id: decoded._id },
					{ "$set": {
						subjectCode: req.body.subjectCode
					}},
					{ "new": true });
				
				subjectCodeResult = await SubjectCode.findOneAndUpdate(
					{ subjectCode: req.body.subjectCode },
					{ "$set": {
						userId: decoded._id,
						activatedAt: Date.now(),
						expiresAt: new Date(Date.now()+(43200*1000*2*31*6))
					}},
					{ "new": true });
				// Validate if successful
				if (userResult && subjectCodeResult) {
					res.status(200).json({
						message: 'Subject Code has been activated.',
						details: {
							activatedBy: decoded.email,
							subjectCode: userResult.subjectCode,
							activatedAt: subjectCodeResult.activatedAt,
							expiresAt: subjectCodeResult.expiresAt
						}
					});

					let details = {
						module: tag,
						subjectCode: subjectCodeResult.subjectCodes,
						subjects: subjectCodeResult.subjects,
						activatedAt: subjectCodeResult.activatedAt,
						expiresAt: subjectCodeResult.expiresAt
					};

					ActivityController.addActivity(details, decoded._id);
				} else {
					res.status(500).json({ 
						message: 'Something went wrong.' 
					});
				}
			} else {
				res.status(500).json({ 
					message: 'Something went wrong.' 
				});
			} 
		}	
	},

	sendSubjectCode: async (req,res) => {
		// Send Subject Code to user email 
		let subjectCode, user; 
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
			subjectCode = await SubjectCode.findOne({ subjectCode: req.body.subjectCode});
			user = await User.findOne({ email: req.body.email});
		} finally {
			if(!user) {
				res.status(400).json({ 
					message: 'Email address is not yet enrolled.' 
				});
			} else if (!subjectCode) {
				res.status(400).json({ 
					message: 'Subject code does not exist.' 
				});
			} else {
				let mailOptions = {
						from: `Pinnacle Review School <${config.mail.auth.user}>`,  
						to: user.email,
						subject: 'Pinnacle App Subject Code',
						html: '<p>Congratulations! You have successfuly purchased a subject code! <br><br>Subject Code : ' + subjectCode.subjectCode + '<br><br>Activate your subcription by using the mobile or web app.<br></p>'
					};
				sendMail = await transporter.sendMail(mailOptions);
				if (!sendMail) {
					res.status(500).json({
						message: 'Email sending failed. Please try again.'+ req.body.email
					});
				} else {
					res.status(200).json({
						message: 'Subject code has been sent to '+ req.body.email
					});
					console.log('Email has been sent to '+ user.email);				
				}
			}
		}
	}
}

module.exports = SubjectController;