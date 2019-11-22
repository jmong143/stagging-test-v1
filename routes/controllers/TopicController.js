/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

/* Models */
const Topic = require('../../models/Topic');
const Subject = require('../../models/Subject');
const User = require('../../models/Users');
const SubjectUpdates = require('../../models/SubjectUpdates');
const Question = require('../../models/Question');

const AuditTrail = require('./AuditTrailController');
const tag = 'Topics';

const TopicController = {

	/* Create new Topic */
	createTopic: async (req, res) => {
		const action = 'Create Topic';
		let subject, topicCount, _topic, saveTopic;

		try {
			subject = await Subject.findOne( { _id: req.params.subjectId } ); 
			topicCount = await Topic.count( { subjectId: req.params.subjectId } );

			_topic = new Topic ({
				_id: new mongoose.Types.ObjectId(),
				description: req.body.description,
				topicNumber: topicCount + 1 ,
				subjectId: req.params.subjectId,
				lessons: [],
				createdAt: Date.now(),
				isArchive: false
			});

			saveTopic = await _topic.save();
			res.status(200).json({
				result: 'success',
				message: "Topic Successfully added.",
				data: {
					id: saveTopic._id,
					description: saveTopic.description,
					subjectId: saveTopic.subjectId,
					lessons: saveTopic.lessons,
					createdAt: saveTopic.createdAt,
					isArchive: saveTopic.isArchive
				}
			});

			let log = {
				module: tag,
				action: action,
				details: {
					topic: saveTopic.description
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new topic',
				errror: e.message
			});
		}
	},

	/* Get All Topics on a subject */
	getTopics: async (req, res) => {
		let token = req.headers['token'];
		let subject, topics, user, decoded, questions;
		let questionIds = {};
		let data = [];
		let query = { 
			$and: [
				{ subjectId: req.params.subjectId },
				{ isArchive: false }
			]};
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});
			
			// Show only unarchived topics on non-admin users
			if (user.isAdmin === false) {
				query.$and.push({ isArchive: false });
			}

			subject = await Subject.findOne( { _id: req.params.subjectId } );
			topics = await Topic.find(query);
			questions = await Question.find({ subjectId: subject._id, isArchive: false });
			questions.forEach((question) => {
				questionIds[question.topicId] ? questionIds[question.topicId]++ : questionIds[question.topicId] = 1
			});
		} finally {

			if (!decoded) {
				res.status(401).json({
					result: 'failed',
					message: 'Unauthorized'
				});
			} else if (!subject) {
				res.status(400).json({
					result: 'failed',
					message: 'Subject does not exist.'
				});
			} else if (!topics) {
				res.status(500).json({
					result: 'failed',
					message: 'Failed to get topic'
				});
			} else {
				topics.forEach((topic) => {
					data.push({
						id: topic._id,
						topicNumber: topic.topicNumber,
						hasQuestions: !!questionIds[topic._id],
						numberOfQuestions: questionIds[topic._id] || 0,
						description: topic.description,
						subjectId: topic.subjectId,
						lessons: topic.lessons,
						createdAt: topic.createdAt,
						isArchive: topic.isArchive
					});
				});
				res.status(200).json({
					result: 'success',
					message: 'Successfully get list of topics.',
					data: data
				});
			}
		}
	},

	/* Get Topic Details */
	getTopic: async (req, res) => {
		
		let topic;

		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
		} finally {
			if (!topic) {
				res.status(400).json({
					result: 'failed',
					message: 'Topic does not exist.'
				});
			} else {
				res.status(200).json({
					result: 'success',
					message: 'Successfully get topic details.',
					data:{
						id: topic._id,
						topicNumber: topic.topicNumber,
						description: topic.description,
						subjectId: topic.subjectId,
						lessons: topic.lessons,
						createdAt: topic.createdAt,
						isArchive: topic.isArchive
					}
				});
			}
		}

	},

	/* Update Topic */
	updateTopic: async (req, res) => {
		const action = 'Update Topic';
		let topic, updateTopic, subject, topicBody;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId },
					{ subjectId: req.params.subjectId }
				]
			});
			subject = await Subject.findOne({ _id: topic.subjectId });
			topicBody = req.body;
			topicBody.updatedAt = Date.now()
			updateTopic = await Topic.findOneAndUpdate(
				{ _id: req.params.topicId},
				{ $set: topicBody },
				{ new: true }
			);
			
			res.status(200).json({
				result: 'success',
				message: 'Topic details successfuly updated.',
				data: updateTopic
			});

			let log = {
				module: tag,
				action: action,
				details: {
					topic: updateTopic.description
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update topic details.',
				error: e.message
			})
		}
	},

	/* Archive topics */
	archiveTopic: async (req, res)=> {
		const action = 'Archive Topic';
		let topic, updateTopic;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
			updateTopic = await Topic.findOneAndUpdate(
				{ _id: req.params.topicId},
				{ $set: {
					isArchive: true
				}},
				{ new: true }
			);

			let log = {
				module: tag,
				action: action,
				details: {
					topic: updateTopic.description
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token); 
			res.status(200).json({
				result: 'success',
				message: 'Topic successfuly archived.',
				data: updateTopic
			});

		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Something went wrong.',
				error: e.message
			});
		}
	}
}

module.exports = TopicController;