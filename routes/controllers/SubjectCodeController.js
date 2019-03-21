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

	getSubjectCodes: (req, res) => {
		SubjectCode.find().exec(function(err, subjectCodes) {
			let newBody = {
				subjectCodes: [],
				total: subjectCodes.length
			};
			subjectCodes.forEach((subjectCode)=>{
				newBody.subjectCodes.push({
					id: subjectCode._id,
					subjectCode: subjectCode.subjectCode,
					userId: subjectCode.userId || '',
					subjects: subjectCode.subjects
				});
			});
			res.status(200).json(newBody);
		});
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

	activateSubjectCode: function (req, res) {
		let token = req.headers['token'];
		if (!token){
			res.status(401).json({ auth: false, message: 'No token provided.' })
		};

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				res.status(401).json({ 
					auth: false, 
					message: 'Failed to authenticate token.' 
				});
			} else {

				// Validate if the user already has a subject code
				User.findOne({ _id: decoded._id}).exec(function(err, user){
					console.log(user);
					if(user.subjectCode){
						return res.status(400).json({ 
							message: 'You already have a subject code.' 
						});	
					} else {
						SubjectCode.findOne({ subjectCode: req.body.subjectCode}).exec(function(err, subjectCode){
							if (!subjectCode) {
								return res.status(400).json({ 
									message: 'Subject code does not exist.' 
								});	
							} else if (subjectCode.userId) {
								return res.status(400).json({ 
									message: 'Subject code already used.' 
								});	
							} else {
								// Activate Subject Code
								User.findOneAndUpdate({ _id: decoded._id },
									{ "$set": {
										subjectCode: req.body.subjectCode
									}},{ "new": true }, 
									function(err, result){
										if (!result) {
											res.status(500).json({
												message: "Something went wrong."
											});
										} else {
											SubjectCode.findOneAndUpdate(
												{ subjectCode: req.body.subjectCode },
												{ "$set": {
													userId: decoded._id,
													activatedAt: Date.now(),
													expiresAt: new Date(Date.now()+(43200*1000*2*31*6))
												}},{ "new": true }, 
												function(err, result){
													
													if (!result) {
														res.status(500).json({
															message: "Something went wrong"
														});
													} else {
														res.status(200).json({
															message: 'Subject Code has been activated.',
															details: {
																activatedBy: decoded.email,
																subjectCode: result.subjectCode,
																activatedAt: result.activatedAt,
																expiresAt: result.expiresAt
															}
														});
													}
												});	
										}
									});
							}
						});
					}			
				});	
			}
		});
	}
}

module.exports = SubjectController;