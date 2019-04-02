//Model
const Topic = require('../../models/Topic');
const Subject = require('../../models/Subject');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

const TopicController = {

	/* Create new Topic */
	createTopic: async (req, res) => {

		let subject, topicCount, _topic;

		try {

			subject = await Subject.findOne( { _id: req.params.subjectId } ); 
			topicCount = await Topic.count( { subjectId: req.params.subjectId } );
		} finally {
			if (!subject) {
				res.status(400).json({
					message: 'Subject does not exist.'
				});
			} else {

				 _topic = new Topic ({
					_id: new mongoose.Types.ObjectId(),
					description: req.body.description,
					topicNumber: topicCount + 1 ,
					subjectId: req.params.subjectId,
					isArchive: false
				});

				await _topic.save();
				res.status(200).json({
					message: 'New Topic has been added.'
				});
			}
		}
	},

	/* Get All Topics on a subject */
	getTopics: async (req, res) => {
		let token = req.headers['token'];
		let subject, topics, user, decoded;
		let newBody = [];
		let query = { 
			$and: [
				{ subjectId: req.params.subjectId }
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
		} finally {

			if (!decoded) {
				res.status(401).json({
					message: 'Unauthorized'
				});
			} else if (!subject) {
				res.status(400).json({
					message: 'Subject does not exist.'
				});
			} else if (!topics) {
				res.status(200).json(newBody);
			} else {
				topics.forEach((topic) => {
					newBody.push({
						id: topic._id,
						topicNumber: topic.topicNumber,
						description: topic.description
					});
				});
				res.status(200).json(newBody);
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
					message: 'Topic does not exist.'
				});
			} else {
				res.status(200).json({
					id: topic._id,
					description: topic.description,
					topicNumber: topic.topicNumber,
					subjectId: topic.subjectId,
					createdAt: topic.createdAt,
					isArchive: topic.isArchive
				});
			}
		}

	},

	/* Update Topic */
	updateTopic: async (req, res) => {
		let topic;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
		} finally {
			if(!topic) {
				res.status(400).json({
					message: 'Topic does not exist.'
				});
			} else {
				await Topic.findOneAndUpdate(
					{ _id: req.params.topicId},
					{ $set: {
						description: req.body.description,
						topicNumber: req.body.topicNumber,
						isArchive: req.body.isArchive
					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'Topic details successfuly updated.'
				});
			}
		}
	},

	/* Archive topics */
	archiveTopic: async (req, res)=> {
		let topic;
		try {
			topic = await Topic.findOne({
				$and: [
					{ _id: req.params.topicId},
					{ subjectId: req.params.subjectId}
				]
			});
		} finally {
			if(!topic) {
				res.status(400).json({
					message: 'Topic does not exist.'
				});
			} else {
				await Topic.findOneAndUpdate(
					{ _id: req.params.topicId},
					{ $set: {
						isArchive: true
					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'Topic successfuly archived.'
				});
			}
		}
	}
}

module.exports = TopicController;