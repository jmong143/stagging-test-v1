/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const Test = require('../../models/Test');
const Subject = require('../../models/Subject');
const ExamRecords = require('../../models/ExamRecords');
const User = require('../../models/Users');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Config = require('../../config');

const questionCount = parseInt(Config.questions.testCount);

const TestController = {
	// generate test
	generate: async (req, res) => {
		let questions, numberOfQuestions, topic;
		numberOfQuestions = questionCount;
		let newBody= {
			total: 0,
			items: []
		};

		if(req.query.numberOfQuestions)
			numberOfQuestions = parseInt(req.query.numberOfQuestions);
		
		try {
			console.log(numberOfQuestions);
			topic = await Topic.findOne({ _id: req.params.topicId });
			if (!topic) 
				throw new Error('Topic not found.')
			questions = await Question.aggregate([ {$sample: {size: numberOfQuestions}} ]); 
			newBody.items = questions;
			newBody.total = questions.length;
			res.status(200).json(newBody);
		} catch(e) {
			res.status(500).json({
				message: 'Something went wrong.',
				error : e.message
			});
		}
	},

	// Submit answers
	submit: async (req, res) => {
		let user, saveExam, examRecord, decoded;
		let token = req.headers.token;
		try {
			// Get User Details
			decoded = await jwt.verify(token, Config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			// console.log(user);
			// Save Exam Records
			examRecord = new ExamRecords({
				_id: new mongoose.Types.ObjectId(),
				userId: user._id,
				topicId: req.body.topicId,
				numberOfQuestions: req.body.numberOfQuestions,
				score: req.body.score,
				createdAt: Date.now()
			});

			saveExam = await examRecord.save();
			res.status(200).json({
				message: "Test records successfuly evaluated and saved.",
				details: saveExam
			});
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		}
	},

	// Get Results
	getResult: async (req, res) => {

	}
}


module.exports = TestController;