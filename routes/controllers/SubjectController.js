/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* Models */
const Subject = require('../../models/Subject');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');
const config = require('../../config').auth; 
const SubjectUpdates = require('../../models/SubjectUpdates');
const Questions = require('../../models/Question');
const AuditTrail = require('./AuditTrailController');
const tag = 'Subjects'
const SubjectController = {

	createSubject: async (req, res) => {
		// Create new Subject
		let saveSubject, saveUpdate;
		const action = 'Create Subject';
		try {
			const _subject = new Subject ({
				_id: new mongoose.Types.ObjectId(),
				name: req.body.name,
				code: req.body.code,
				description: req.body.description,
				imageUrl: req.body.imageUrl
			});
			saveSubject = await _subject.save();
			res.status(200).json({
				result: 'success',
				message: "Successfuly created a new subject.",
				data: saveSubject
			});
			let log = {
				module: tag,
				action: action,
				details: {
					subject: saveSubject.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new subject',
				error: e.message
			});
		} 
	},

	getSubjects: async (req, res) => {

		let token = req.headers['token'];
		let decoded, user, subjectCode, subjects, questions;
		let questionIds = {};
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id });
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode }); 
			subjects = await Subject.find({ isArchive: false }).sort({ createdAt: -1 });
			questions = await Questions.find({ isArchive: false });

			questions.forEach((question)=> {
				questionIds[question.subjectId] ? questionIds[question.subjectId]++ : questionIds[question.subjectId] = 1
			});
		} finally {
			if (!decoded || !user) {
				res.status(401).json({
					result: 'failed', 
					message: 'Unauthorized.' 
				});	
			} else if (!subjectCode && user.isAdmin == true) {
				// if admin User
				let newBody = {
					subjects: [],
					total: subjects.length
				};
				subjects.forEach((subject)=>{
					newBody.subjects.push({
						id: subject._id,
						code: subject.code,
						name: subject.name,
						description: subject.description,
						imageUrl: subject.imageUrl,
						createdAt: subject.createdAt,
						isArchive: subject.isArchive,
						numberOfQuestions: questionIds[subject._id] || 0
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get list of subjects.',
					data: newBody
				});
			} else if (!subjectCode && user.isAdmin == false) {
				let newBody = {
					subjects: [],
					total: subjects.length
				};
				subjects.forEach((subject)=>{
					newBody.subjects.push({
						id: subject._id,
						code: subject.code,
						name: subject.name,
						description: subject.description,
						imageUrl: subject.imageUrl,
						createdAt: subject.createdAt,
						isArchive: subject.isArchive,
						numberOfQuestions: questionIds[subject._id],
						questions: questions
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get list of subjects.',
					data: newBody
				});
			} else if (subjectCode && user.isAdmin == false) {
				let subjectIds = [];
				let newBody = {
					subjects: [],
					total: subjects.length
				};
				subjectCode.subjects.forEach((subject)=>{
					subjectIds.push(subject.subjectId);
				});

				subjects.forEach((subject)=>{
					let isEnrolled = false;

					if (subjectIds.indexOf(subject.id) > -1) {
						isEnrolled = true;
					}

					newBody.subjects.push({
						id: subject._id,
						code: subject.code,
						name: subject.name,
						description: subject.description,
						imageUrl: subject.imageUrl,
						numberOfQuestions: questionIds[subject._id],
						createdAt: subject.createdAt,
						isArchive: subject.isArchive,
						isEnrolled: isEnrolled 
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get list of subjects.',
					data: newBody
				});
			}
		}
	},

	getSubject: async (req, res) => {
		let subject;

		try {
			subject = await Subject.findOne({ _id: req.params.subjectId });
			res.status(200).json({
				result: 'success',
				message: 'Successfully get subject details.',
				data: {
					id: subject._id,
					code: subject.code,
					name: subject.name,
					description: subject.description,
					imageUrl: subject.imageUrl,
					createdAt: subject.createdAt,
					isArchive: subject.isArchive
				}
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get subject details.',
				error: e.message
			})
		}
	},

	getEnrolleesCount: async (req, res) => {
		let subjects, subjectCodes, tmpSubjects, tmpKeys, newBody;
		try {
			subjects = await Subject.find();
			subjectCodes = await SubjectCode.find( { userId: { $ne: "" } } );
		} finally {
			if (subjects && subjectCodes) {
				tmpSubjects = {};
				subjects.forEach((subject) => {
					tmpSubjects[subject._id] = 0;
				});
				
				subjectCodes.forEach((sc)=>{
					sc.subjects.forEach((subject)=>{
						tmpSubjects[subject.subjectId] += 1;
					});
				});

				tmpKeys = Object.keys(tmpSubjects);
				newBody = [];
				tmpKeys.forEach((key, i)=> {
					let sb = subjects.find(x => x['id'] === key);
					if (sb) {
						newBody.push({
							id: key,
							name: sb.name,
							totalEnrolled: tmpSubjects[key]
						});	
					}
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get enrollees count',
					data: newBody
				});
			} else {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			}
		}
	},

	getSubjectCodes: async (req,res)=> {
		let subjectCodes, subject;
		
		try {
			subject = await Subject.findOne({ _id: req.params.subjectId });
			subjectCodes = await SubjectCode.find();
			let response = {
				id: subject._id,
				code: subject.code,
				name: subject.name,
				description: subject.description,
				imageUrl: subject.imageUrl,
				createdAt: subject.createdAt,
				subjectCodes: []
			};

			subjectCodes.forEach((sc)=> {
				sc.subjects.forEach((subject)=> {
					if(subject.subjectId == req.params.subjectId) {
						response.subjectCodes.push(sc.subjectCode);
					}
				});
			});

			res.status(200).json({
				result: 'success',
				message: 'Succesfully get subject code list',
				data: response	
			});

		} catch (e) {
			res.status(400).json({
				result: 'failed',
				message: 'Failed to get subject codes.',
				error: e.message
			})
		}
	},

	archiveSubject: async (req, res) => {
		const action = 'Archive Subject'
		let archiveSubject;
		try {
			archiveSubject = await Subject.findOneAndUpdate(
				{ _id: req.params.subjectId },
				{ $set: {
					isArchive: true
				}},
				{ new: true }
			);

			res.status(200).json({
				result: 'success',
				message: 'Subject successfuly archived.',
				data: archiveSubject
			});

			let log = {
				module: tag,
				action: action,
				details: {
					subject: archiveSubject.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to archive subject.',
				error: e.message
			});
		}
	},

	updateSubject: async (req, res) => {
		let subject, updateSubject;
		const action = 'Update Subject';
		try {
			subject = await Subject.findOne({ _id: req.params.id });
			updateSubject = await Subject.findOneAndUpdate(
				{ _id: req.params.subjectId },
				{ $set: req.body },
				{ new: true });
			if(!updateSubject && !subject)
				throw new Error('Subject doesnt exist.');

			res.status(200).json({
				result: 'success',
				message: 'Subject details successfully updated.',
				data: updateSubject
			});

			let log = {
				module: tag,
				action: action,
				details: {
					subject: updateSubject.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update subject.',
				error: e.message
			});
		}
	}
}

module.exports = SubjectController;