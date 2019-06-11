/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const Topic = require('../../models/Topic');
const Lesson = require('../../models/Lesson');

const ActivityController = {
	
	addQuestion: async (req, res) => {
		let subject, topic, lesson, _question, saveQuestion;
		try {
			//Validations
			subject = await Subject.findOne({ _id: req.body.subjectId });
			topic = await Topic.findOne({ _id: req.body.topicId });
			lesson = await Lesson.findOne({ _id: req.body.lessonId });
		} finally {

			if (!subject) {
				res.status(400).json({
					message: 'Subject does not exist.'
				});
			} else if (!topic) {
				res.status(400).json({
					message: 'Subject does not exist.'
				});
			} else if (!lesson) {
				res.status(400).json({
					message: 'Lesson does not exist.'
				});
			} else {
				_question = new Question({
					_id: new mongoose.Types.ObjectId(),
					question: req.body.question,
					choices: req.body.choices,
					answer: req.body.answer,
					subjectId: req.body.subjectId,
					topicId: req.body.topicId,
					lessonId: req.body.lessonId,
					difficulty: req.body.difficulty,
					resourceUrl: req.body.resourceUrl,
					isArchive: false
				});

				saveQuestion = await _question.save();

				if(!saveQuestion) {
					res.status(400).json({
						message: "Something went wrong."
					});
				} else {
					res.status(200).json({
						message: "New question successfully added."
					});
				}
			}	
		}
	},

	getQuestions: async (req,res) => {
		let questions, newBody;
		let keyword = req.query.keyword;
		let lessonId = req.query.lessonId;
		let difficulty = req.query.difficulty;
		let query = [];

		if(keyword) {
			query.push({
				$match: {
					"question": {'$regex': '^'+keyword, '$options' : 'i'}
				} 
			});
		}

		if(lessonId) {
			query.push({
				$match: {
					"lessonId": lessonId
				} 
			});
		}

		if(difficulty) {
			query.push({
				$match: {
					"difficulty": difficulty
				} 
			});
		}

		try {
			if(query.length <= 0) {
				questions = await Question.find();
			} else {
				questions = await Question.aggregate(query);	
			}
		} finally {
			if(!questions) {
				res.status(400).json({
					message: 'No Questions found.'
				});
			} else {
				newBody = [];
				questions.forEach((question)=>{
					newBody.push({
						id: question._id,
						question: question.question,
						choices: question.choices,
						answer: question.answer,
						subjectId: question.subjectId,
						topicId: question.topicId,
						lessonId: question.lessonId,
						difficulty: question.difficulty,
						resourceUrl: question.resourceUrl,
						isArchive: question.isArchive
					});
				});
			
				res.status(200).json(newBody);
			}
		}
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