/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const Test = require('../../models/Test');
const Subject = require('../../models/Subject');

const Config = require('../../config');

const questionCount = parseInt(Config.questions.testCount);

const TestController = {
	createTest: async (req,res) => {
		let test, saveTest, topic, subject, findTest;

		try {
			findTest = await Test.findOne({ topicId: req.body.topicId });

			if (findTest) {
				throw new Error (`Test for topic ${findTest.topicId} already exists.`);
			}

			if(req.body.questions.length !== questionCount) {
				throw new Error(`Number of questions must be ${questionCount}`);
			}

			topic = await Topic.findOne({ _id: req.body.topicId });
			subject = await Subject.findOne({ _id: req.body.subjectId });
			test = new Test({
				_id: new mongoose.Types.ObjectId(),
				questions: req.body.questions,
				subjectId: req.body.subjectId,
				topicId: req.body.topicId,
				isArchive: false
			});

			saveTest = await test.save();

			res.status(200).json({
				message: 'New test has been created.',
				test: saveTest
			});

		} catch (e) {
			res.status(500).json({
				message: 'Failed to create test.',
				error: e.message
			});
		}
	},

	getBySubject: async (req, res) => {
		// Get all Test by subjectId
		let test;
		try {
			test = await Test.find({ subjectId: req.params.subjectId });
			res.status(200).json(test);
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		} 
	},

	getByTopic: async (req, res) => {
		let questions, test, topic;
		let query = {
			_id: {
				$in: []
			}
		};	
		try {
			topic = await Topic.findOne({ _id: req.params.topicId});
			test = await Test.findOne({ topicId: req.params.topicId });
			let questionIds = test.questions;

			questionIds.forEach((id)=> {
				query._id.$in.push(id);
			});

			questions = await Question.find(query);
			await questions.sort(()=> Math.random() - 0.5);
			res.status(200).json({
				id: test._id,
				questions: questions,
				total: questions.length,
				subjectId: test.subjectId,
				topicId: test.topicId,
				isArchive: test.isArchive
			});

		} catch (e) {
			res.status(500).json({
				message: 'Failed to get test',
				error: e.message
			});
		}
	},

	updateTest: async (req,res) => {
		let updateTest;
		try {
			if(req.body.questions.length !== questionCount) {
				throw new Error(`Number of questions must be ${questionCount}`);
			}

			updateTest = await Test.findOneAndUpdate(
				{ topicId: req.params.topicId },
				{ "$set": {
					questions: req.body.questions
				}},
				{ $new: true });
			res.status(200).json({
				message: 'Test successfully updated.',
				test: updateTest
			});

		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				errro: e.message
			});
		}
	},

	deleteTest: async (req,res) => {
		let deleteTest;

		try {
			deleteTest = await Test.findOneAndDelete({ topicId: req.params.topicId });
			if (!deleteTest) {
				throw new Error('Test does not exist');
			}

			res.status(200).json({
				message: 'Test successfully deleted.'
			});
		} catch (e) {
			res.status(500).json({
				message: 'Failed to delete test.',
				error: e.message
			});
		}
	},

	// Submit answers
	evaluateTest: async (req, res) => {

	},

	// Get Results
	getResult: async (req, res) => {

	}
}


module.exports = TestController;