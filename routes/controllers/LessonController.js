//Model
const Lesson = require('../../models/Lesson');
const Topic = require('../../models/Topic');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

const LessonController = {

	createLesson: async (req, res) => {
		let topic, lesson, lessonCount;
		try {
			topic = await Topic.findOne( { _id: req.params.topicId } );
			lessonCount = await Lesson.count( { topicId: req.params.topicId } );
		} finally {
			if(!topic) {
				res.status(400).json({
					message: 'Topic does not exist.'
				});
			} else {
				lesson = new Lesson ({
					_id: new mongoose.Types.ObjectId(),
					topicId: req.params.topicId,
					lessonNumber: lessonCount + 1 ,
					description: req.body.description,
					isArchive: false
				});

				await lesson.save();
				res.status(200).json({
					message: 'New Lesson has been added.'
				})
			}
		}
	},

	getLessons: async (req, res) => {
		let token = req.headers['token'];
		let lessons, user, decoded, topic;
		let newBody = [];
		let query = {
			$and: [
				{ topicId: req.params.topicId }
			]};
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne( { _id: decoded._id } );
			// Show only unarchived lessons on non-admin users
			if (user.isAdmin === false) {
				query.$and.push( { isArchive: false } );
			}
			topic = await Topic.findOne( { _id: req.params.topicId } );
			lessons = await Lesson.find(query).sort({"lessonNumber": 1});
		} finally {
			if (!decoded) {
				res.status(401).json({
					message: 'Unauthorized.'
				});
			} else if (!topic) {
				res.status(400).json({
					message: 'Topic Does Not Exist.'
				});
			} else if (!lessons) {
				res.status(200).json(newBody);
			} else {
				lessons.forEach((lesson) => {
					newBody.push({
						id: lesson._id,
						lessonNumber: lesson.lessonNumber,
						description: lesson.description
					});
				});
				res.status(200).json(newBody);
			}
		}
	},

	getLesson: async (req, res) => {
		let lesson;
		try {
			lesson = await Lesson.findOne({
				$and: [
					{ _id: req.params.lessonId },
					{ topicId: req.params.topicId }
				]
			});
		} finally {
			if (!lesson) {
				res.status(400).json({
					message: 'Lesson does not exist.'
				});
			} else {
				res.status(200).json({
					id: lesson.id,
					lessonNumber: lesson.lessonNumber,
					description: lesson.description,
					subjectId: lesson.subjectId,
					isArchive: lesson.isArchive
				});
			}
		}
	
	},

	updateLesson: async (req, res) => {
		// Update Lesson
		let lesson;
		try {
			lesson = await Lesson.findOne({
				$and: [
					{ _id: req.params.lessonId },
					{ topicId: req.params.topicId }
				]
			});

		} finally {
			if (!lesson) {
				res.status(400).json({
					message: 'Lesson does not exist.'
				});
			} else {
				await Lesson.findOneAndUpdate(
					{ _id: req.params.lessonId },
					{ $set: {
						description: req.body.description,
						lessonNumber: req.body.lessonNumber,
						isArchive: req.body.isArchive
					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'Lesson details successfuly updated.'
				});
			}
		}
	},

	archiveLesson: async (req, res) => {
		// Archive Lesson
		let lesson;
		try {
			lesson = await Lesson.findOne({
				$and: [
					{ _id: req.params.lessonId },
					{ topicId: req.params.topicId }
				]
			});
		} finally {
			if (!lesson) {
				res.status(400).json({
					message: 'Lesson does not exist.'
				});
			} else {
				await Lesson.findOneAndUpdate(
					{ _id: req.params.lessonId },
					{ $set: {
						isArchive: true
					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'Lesson details successfuly archived.'
				});
			}
		}
	}
}

module.exports = LessonController;