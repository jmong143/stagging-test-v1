const SubjectCode = require('../../models/SubjectCode');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config').auth; 
const User = require('../../models/Users');

const SubjectController = {

	generateSubjectCode: async (req, res) => {

		let subjectCode = Math.random().toString(36).substr(2, 8).toUpperCase();
		let _subjects = [];

		try {

			if(req.body.subjects.length < 1) {
				res.status(500).json({
					message: 'Atleast 1 subject is required.'
				});
			} else {
				req.body.subjects.forEach((subject)=>{
					_subjects.push({
						subjectId: subject,
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

	getSubjectCode: (req, res) => {
		SubjectCode.findOne({_id: req.params.subjectCodeId }).exec(function (err, subjectCode) {
			res.status(200).json({
				id: subjectCode._id,
				subjectCode: subjectCode.subjectCode,
				userId: subjectCode.userId || '',
				createdAt: subjectCode.createdAt,
				activatedAt: subjectCode.activatedAt || '',
				expiresAt: subjectCode.expiresAt || '',
				subjects: subjectCode.subjects
			});
		});
	},

	activateSubjectCode: async (req, res) => {
		let token = req.headers['token'];
		let decoded, user, subjectCode, userResult, subjectCodeResult;

		try {
			decoded = await jwt.verify(token, config.secret);
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
	}
}

module.exports = SubjectController;