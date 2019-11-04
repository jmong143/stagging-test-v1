/* Dependencies */
const mongoose = require('mongoose');

const Config = require('../../config');

/* Models */
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');

const choicesCount = parseInt(Config.questions.choicesCount);

const AuditTrail = require('./AuditTrailController');
const tag = 'Questions';

const QuestionController = {
	
	addQuestion: async (req, res) => {
		let question, saveQuestion;
		const action = 'Create Question';
		try {

			let choices = req.body.choices || [];
			let answer = req.body.answer || '';

			if ( choices && choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (choices && choices.indexOf(answer) < 0) {
				throw new Error('Answer must be one of the choices.');
			}

			question = new Question({
				_id: new mongoose.Types.ObjectId(),
				tag: req.body.tag,
				question: req.body.name,
				solution: req.body.solution,
				choices: req.body.choices,
				answer: req.body.answer,
				subjectId: req.body.subjectId,
				topicId: req.body.topicId,
				resourceUrl: req.body.resourceUrl,
				isArchive: false,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});

			saveQuestion = await question.save();

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: saveQuestion.tag
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);

			res.status(200).json({
				result: 'success',
				message: 'New Question has been addded.',
				data: saveQuestion
			})
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new question.',
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
			res.status(200).json({
				result: 'success',
				message: 'Successfully get list of questions.',
				data: questions
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get list of questions',
				error: e.message
			});
		}
	},

	getQuestion: async (req,res) => {
		let question;

		try {
			question = await Question.findOne({ _id: req.params.questionId });
			res.status(200).json({
				result: 'success',
				message: 'Successfully get question Details.',
				data: question
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get question details',
				error: e.message
			});
		}
	},

	updateQuestion: async (req,res) => {
		let question, updateQuestion, questionBody;
		const action = 'Update Question';
		try {

			question = await Question.findOne({ _id: req.params.questionId });
			let choices = req.body.choices || question.choices;
			let answer = req.body.answer || question.answer;
	
			if (choices && choices.length !== choicesCount) {
				throw new Error('Question must have four (4) choices.');
			}

			if (answer && question.choices.indexOf(answer) < 0 ) {
				throw new Error('Answer must be one of the choices.');
			}
			
			questionBody = req.body;
			questionBody.updatedAt = Date.now();

			updateQuestion = await Question.findOneAndUpdate(
				{ _id: req.params.questionId},
				{ $set: questionBody },
				{ new: true }
			);

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: question.tag
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);

			res.status(200).json({
				result: 'success',
				message: 'Question successfuly updated.',
				data: updateQuestion
			})
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update question',
				error: e.message
			})
		}
	},

	deleteQuestion: async (req,res) => {
		let question, _deleteQuestion;
		const action = 'Archive Question';
		try {
			_question = await Question.findOne({ _id: req.params.questionId });
			question = await Question.findOneAndUpdate(
				{ _id: _question._id },
				{ $set: {
					isArchive: true
				}},
				{ new: true}
			);

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: _question.tag
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);


			res.status(200).json({
				result: 'success',
				message: 'Question has been successfuly archived.',
				data: question
			}); 
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to delete question '+ req.params.questionId,
				error: e.message
			});
		}
	}
}


module.exports = QuestionController;