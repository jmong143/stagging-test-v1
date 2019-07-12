/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');

const ActivityController = {
	
	addQuestion: async (req, res) => {
		// Create new Code
	},

	getQuestions: async (req,res) => {
		// Get Questions by Topic
	},

	updateQuestion: async (req,res) => {
		let question, updateQuestion;
		try {
			question = Question.findOne({ _id: req.params.questionId});
		} finally {
			if(!question) {
				res.status(400).json({
					message: 'Question does not exist.'
				});
			} else {
				updateQuestion = await Question.findOneAndUpdate(
					{ _id: req.params.questionId},
					{ $set: {
						question: req.body.question,
						choices: req.body.choices,
						answer: req.body.answer,
						subjectId: req.body.subjectId,
						topicId: req.body.topicId,
						lessonId: req.body.lessonId,
						difficulty: req.body.difficulty,
						resourceUrl: req.body.resourceUrl,
						isArchive: req.body.isArchive
					}},
					{ new: true }
				);

				if (!updateQuestion) {
					res.status(400).json({
						message: 'Something went wrong.'
					});
				} else {
					res.status(200).json({
						message: 'Question details successfully updated.'
					});
				}
			}
		}
	},

	deleteQuestion: async (req,res) => {
		let question, _deleteQuestion;
		try {
			question = await Question.findOne({ _id: req.params.questionId });
		} finally {
			if(!question) {
				res.status(400).json({
					message: 'Question does not exist.'
				});
			} else {
				_deleteQuestion = await Question.deleteOne({ _id: req.params.questionId});
				if(!_deleteQuestion) {
					res.status(500).json({
						message: 'Something went wrong.'
					});
				} else {
					res.status(200).json({
						message: 'Question successfully deleted.'
					});
				}
			}
		}
	}
}


module.exports = ActivityController;