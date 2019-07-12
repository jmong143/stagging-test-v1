/* Dependencies */
const mongoose = require('mongoose');

const Config = require('../../config');

/* Models */
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');

const choicesCount = parseInt(Config.questions.choicesCount);

const ActivityController = {
	
	addQuestion: async (req, res) => {
		let question, saveQuestion;

		try {
			if (req.body.choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (req.body.choices.indexOf(req.body.answer) < 0) {
				throw new Error('Answer must be one of the choices.');
			}

			question = new Question({
				_id: new mongoose.Types.ObjectId(),
				question: req.body.name,
				choices: req.body.choices,
				answer: req.body.answer,
				subjectId: req.body.subjectId,
				topicId: req.body.topicId,
				difficulty: req.body.difficulty,
				resourceUrl: req.body.resourceUrl,
				isArchive: false
			});

			saveQuestion = await question.save();

			res.status(200).json({
				message: 'New Question has been addded.',
				question: saveQuestion
			})
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			})
		}
	},

	getQuestions: async (req,res) => {
		let questions;
		let subjectId = req.query.subjectId;
		let topicId = req.query.topicId;
		
		let query = [
			{ $match: { isArchive: false }}
		];

		if (subjectId) {
			query.push({ $match: { subjectId: subjectId }});
		}

		if (topicId) {
			query.push({ $match: {topicId: topicId }});
		}

		try {
			questions = await Question.aggregate(query);
			res.status(200).json(questions);
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		}
	},

	updateQuestion: async (req,res) => {
		let question, updateQuestion;
		try {
			if (req.body.choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (req.body.choices.indexOf(req.body.answer) < 0) {
				throw new Error('Answer must be one of the choices.');
			}

			updateQuestion = await Question.findOneAndUpdate(
				{ _id: req.params.questionId},
				{ $set: {
					question: req.body.question,
					choices: req.body.choices,
					answer: req.body.answer,
					subjectId: req.body.subjectId,
					topicId: req.body.topicId,
					difficulty: req.body.difficulty,
					resourceUrl: req.body.resourceUrl,
					isArchive: req.body.isArchive
				}},
				{ new: true }
			);

			res.status(200).json({
				message: 'Question successfuly updated.',
				question: updateQuestion
			})
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			})
		}
	},

	deleteQuestion: async (req,res) => {
		let question, _deleteQuestion;
		
		try {
			question = await Question.findOneAndUpdate(
				{ _id: req.params.questionId},
				{ $set: {
					isArchive: true
				}},
				{ new: true}
			);

			res.status(200).json({
				message: 'Question has been successfuly archived.'
			}); 
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		}
	}
}


module.exports = ActivityController;