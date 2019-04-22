//Model
const Subject = require('../../models/Subject');
const SubjectCode = require('../../models/SubjectCode');
const mongoose = require('mongoose');

const SubjectController = {

	createSubject: (req, res) => {
		// Create new Subject
		const _subject = new Subject ({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			code: req.body.code,
			description: req.body.description
		});

		_subject.save().then(function (result) {
			res.status(200).json({
				message: 'New Subject has been added.'
			});
		}, function (err) {
			console.log(err);
			res.status(500).json({
				message: 'Something went wrong.'
			});
		});
	},

	getSubjects: (req, res) => {
		Subject.find().exec(function(err, subjects) {
			let newBody = {
				subjects: [],
				total: subjects.length
			};
			subjects.forEach((subject)=>{
				newBody.subjects.push({
					id: subject._id,
					name: subject.name
				});
			});
			res.status(200).json(newBody);
		});
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