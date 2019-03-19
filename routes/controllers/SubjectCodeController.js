//Model
const SubjectCode = require('../../models/SubjectCode');
const mongoose = require('mongoose');

const SubjectController = {

	generateSubjectCode: function (req, res) {
		// Generate new SubjectCode
		let subjectCode = Math.random().toString(36).substr(2, 8).toUpperCase();
		let _subjects = [];
		req.body.subjects.forEach((subject)=>{
			_subjects.push({
				subjectId: subject,
				progress: 0
			});
		});

		const _subjectCode = new SubjectCode ({
			_id: new mongoose.Types.ObjectId(),
			subjectCode: subjectCode,
			subjects: _subjects
		});

		_subjectCode.save().then(function (result) {
			res.status(200).json({
				message: 'Subject Code has been generated.',
				id: result._id,
				subjectCode: result.subjectCode,
				subjects: result.subjects
			});
		}, function (err) {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	},

	getSubjectCodes: function (req, res) {
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

	getSubjectCode: function (req, res) {
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
	}
}

module.exports = SubjectController;