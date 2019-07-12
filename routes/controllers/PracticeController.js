/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Topic = require('../../models/Topic');
const Practice = require('../../models/Practice');
const Subject = require('../../models/Subject');

const Config = require('../../config');

const questionCount = parseInt(Config.questions.practiceCount);

const PracticeController = {
	createPractice: async (req,res) => {
		let practice, savePractice, topic, subject, findPractice;

		try {
			findPractice = await Practice.findOne({ topicId: req.body.topicId });

			if (findPractice) {
				throw new Error (`Practice exam for topic ${findPractice.topicId} already exists.`);
			}

			if(req.body.questions.length !== questionCount) {
				throw new Error(`Number of questions must be ${questionCount}`);
			}

			topic = await Topic.findOne({ _id: req.body.topicId });
			subject = await Subject.findOne({ _id: req.body.subjectId });
			practice = new Practice({
				_id: new mongoose.Types.ObjectId(),
				questions: req.body.questions,
				subjectId: req.body.subjectId,
				topicId: req.body.topicId,
				isArchive: false
			});

			savePractice = await practice.save();

			res.status(200).json({
				message: 'New practice exam has been created.',
				practice: savePractice
			});

		} catch (e) {
			res.status(500).json({
				message: 'Failed to create practice exam.',
				error: e.message
			});
		}
	},

	getBySubject: async (req, res) => {
		// Get all Practice by subjectId
		let practice;
		try {
			practice = await Practice.find({ subjectId: req.params.subjectId });
			res.status(200).json(practice);
		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				error: e.message
			});
		} 
	},

	getByTopic: async (req, res) => {
		let questions, practice, topic;
		let query = {
			_id: {
				$in: []
			}
		};	
		try {
			topic = await Topic.findOne({ _id: req.params.topicId});
			practice = await Practice.findOne({ topicId: req.params.topicId });
			let questionIds = practice.questions;

			questionIds.forEach((id)=> {
				query._id.$in.push(id);
			});

			questions = await Question.find(query);
			await questions.sort(()=> Math.random() - 0.5);
			res.status(200).json({
				id: practice._id,
				questions: questions,
				total: questions.length,
				subjectId: practice.subjectId,
				topicId: practice.topicId,
				isArchive: practice.isArchive
			});

		} catch (e) {
			res.status(500).json({
				message: 'Failed to get practice',
				error: e.message
			});
		}
	},

	updatePractice: async (req,res) => {
		let updatePractice;
		try {
			if(req.body.questions.length !== questionCount) {
				throw new Error(`Number of questions must be ${questionCount}`);
			}

			updatePractice = await Practice.findOneAndUpdate(
				{ topicId: req.params.topicId },
				{ "$set": {
					questions: req.body.questions
				}},
				{ $new: true });
			res.status(200).json({
				message: 'Practice exam successfully updated.'
			});

		} catch (e) {
			res.status(500).json({
				message: 'Something went wrong',
				errro: e.message
			});
		}
	},

	deletePractice: async (req,res) => {
		let deletePractice;

		try {
			deletePractice = await Practice.findOneAndDelete({ topicId: req.params.topicId });
			if (!deletePractice) {
				throw new Error('Practice exam does not exist');
			}

			res.status(200).json({
				message: 'Practice exam successfully deleted.'
			});
		} catch (e) {
			res.status(500).json({
				message: 'Failed to delete practice exam.',
				error: e.message
			});
		}
	}
}


module.exports = PracticeController;