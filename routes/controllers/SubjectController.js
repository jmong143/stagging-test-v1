//Model
const Subject = require('../../models/Subject');
const mongoose = require('mongoose');

const SubjectController = {

	createSubject: function (req, res) {
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
				error: err
			});
		});
	},

	getSubjects: function (req, res) {
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

	getSubject: function (req, res) {
		Subject.findOne({_id: req.params.subjectId }).exec(function (err, subject) {
			res.status(200).json({
				id: subject._id,
				name: subject.name,
				description: subject.description,
				createdAt: subject.createdAt
			});
		});
	}
}

module.exports = SubjectController;