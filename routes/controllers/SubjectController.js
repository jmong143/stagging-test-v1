/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* Models Required */
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
			description: req.body.description
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
					updatedAt: Date.now()
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
			subjects = await Subject.find();
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
						createdAt: subject.createdAt 
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
						createdAt: subject.createdAt,
						isEnrolled: false 
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
						createdAt: subject.createdAt,
						isEnrolled: isEnrolled 
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
				tmpKeys.forEach((key)=> {
					let sb = subjects.find(x => x['id'] === key);

					newBody.push({
						id: key,
						name: sb.name,
						totalEnrolled: tmpSubjects[key]
					});
				});
				res.status(200).json(newBody);
			} else {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			}
		}
	}
}

module.exports = SubjectController;