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

const SubjectController = {

	createSubject: async (req, res) => {
		// Create new Subject
		let saveSubject, saveUpdate;

		const _subject = new Subject ({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			code: req.body.code,
			description: req.body.description,
			imageUrl: req.body.imageUrl
		});

		try {
			saveSubject = await _subject.save();
		} finally {
			if (!saveSubject) {
				//console.log(err);
				res.status(500).json({
					message: 'Something went wrong.'
				});
			} else {
				let _updates = new SubjectUpdates ({
					_id: new mongoose.Types.ObjectId(),
					subjectId: saveSubject.id,
					topicId: '',
					lessonId: '',
					description: 'New Subject Added.',
					name: saveSubject.name,
					updatedAt: Date.now(),
					isArchive: false
				});
				
				await _updates.save();
				res.status(200).json({
					message: 'New Subject has been added.'
				});
			}
		}
	},

	getSubjects: async (req, res) => {

		let token = req.headers['token'];
		let decoded, user, subjectCode, subjects;
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}); 
			subjects = await Subject.find({ isArchive: false });
		} finally {
			if (!decoded || !user) {
				res.status(401).json({ 
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
						name: subject.name,
						imageUrl: subject.imageUrl,
						createdAt: subject.createdAt,
						isArchive: subject.isArchive
					});
				});
				res.status(200).json(newBody);
			} else if (!subjectCode && user.isAdmin == false) {
				let newBody = {
					subjects: [],
					total: subjects.length
				};
				subjects.forEach((subject)=>{
					newBody.subjects.push({
						id: subject._id,
						name: subject.name,
						imageUrl: subject.imageUrl,
						createdAt: subject.createdAt,
						isEnrolled: false,
						isArchive: subject.isArchive 
					});
				});
				res.status(200).json(newBody);
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
						name: subject.name,
						imageUrl: subject.imageUrl,
						createdAt: subject.createdAt,
						isEnrolled: isEnrolled,
						isArchive: subject.isArchive 
					});
				});
				res.status(200).json(newBody);
			}
		}
	},

	getSubject: (req, res) => {
		Subject.findOne({_id: req.params.subjectId }).exec(function (err, subject) {
			res.status(200).json({
				id: subject._id,
				name: subject.name,
				description: subject.description,
				imageUrl: subject.imageUrl,
				createdAt: subject.createdAt
			});
		});
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
				res.status(200).json(newBody);
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

			res.status(200).json(response);

		} catch (e) {
			res.status(400).json({
				message: 'Failed to get subject codes.',
				error: e.message
			})
		}
	},

	archiveSubject: async (req, res) => {
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
				message: 'Subject successfuly archived.'
			});
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		}
	}
}

module.exports = SubjectController;