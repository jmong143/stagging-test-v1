/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

/* Models */
const Topic = require('../../models/Topic');
const Lesson = require('../../models/Lesson');

const AuditTrail = require('./AuditTrailController');
const tag = 'Lessons';

const LessonController = {
	createLesson: async (req, res, next) => {
		let lesson, saveLesson, topic, updateTopic, topicLessons;
		const action = 'Create Lesson'
			
		try {
			topic = await Topic.findOne({ _id: req.params.topicId });
			lesson = new Lesson({
				_id: new mongoose.Types.ObjectId(),
				name: req.body.name,
				content: req.body.content,
				topicId: req.params.topicId,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				isArchive: false
			});

			saveLesson = await lesson.save();
			/* Update Topic */
			topicLessons = topic.lessons;
			topicLessons.push(saveLesson._id);
			updateTopic = await Topic.findOneAndUpdate(
				{ _id: topic._id },
				{ $set: { lessons: topicLessons } },
				{ new: true });

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: saveLesson.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);

			res.status(200).json({
				result: 'success',
				message: `Successfully created new lesson for ${topic.description}`,
				data: saveLesson
			});
		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to create new lesson.',
				error: e.message
			});
		}
	},

	getLessons: async (req, res, next) => {
		let lessons;

		try {
			topic = await Topic.findOne({ _id: req.params.topicId})
			lessons = await Lesson.find({ topicId: topic._id });

			res.status(200).json({
				result: 'success',
				message: `Successfully get lessons for topic ${topic.description}`,
				data: lessons
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get lessons.',
				error: e.message
			});
		} 
	},

	getLesson: async (req, res, next) => {
		let lesson;

		try {
			topic = await Topic.findOne({ _id: req.params.topicId });
			lesson = await Lesson.findOne({ _id: req.params.lessonId });

			res.status(200).json({
				result: 'success',
				message: 'succesfully get lesson details.',
				data: lesson
			});

		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get lesson details',
				error: e.message
			});
		}
	},

	updateLesson: async (req, res, next) => {
		let lesson, topic, updateLesson;
		const action = 'Update Lesson';
		try {
			topic = await Topic.findOne({ id: req.params.topicId });
			lesson = await Lesson.findOne({ _id: req.params.lessonId });
			req.body.updatedAt = Date.now();
			updateLesson = await Lesson.findOneAndUpdate(
				{ _id: lesson._id },
				{ $set: req.body },
				{ new: true }
			);

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: updateLesson.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);
			
			res.status(200).json({
				result: 'success',
				message: 'succesfully updated lesson details.',
				data: updateLesson
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to update lesson details',
				error: e.message
			});
		} 

	},

	archiveLesson: async (req, res, next) => {
		const action = 'Archive Lesson';
		let lesson, topic, archiveLesson, topicLessons, updateLesson;
		try {
			topic = await Topic.findOne({ _id: req.params.topicId });
			lesson = await Lesson.findOne({ _id: req.params.lessonId });

			topicLessons = topic.lessons;
			let index = topicLessons.indexOf(lesson._id);
			index > -1 ? topicLessons.splice(index, 1) : null ;
			req.body.updatedAt = Date.now();
			archiveLesson = await Lesson.findOneAndUpdate(
				{ _id: lesson._id },
				{ $set: { isArchive: true }},
				{ new: true}
			).then( async ()=>{
				await Topic.findOneAndUpdate(
					{ _id: topic.id },
					{ $set: { lessons: topicLessons } },
					{ new: true }
				);
			});

			let log = {
				module: tag,
				action: action,
				details: {
					lesson: lesson.name
				}
			};

			AuditTrail.addAuditTrail(log, req.headers.token);
			

			res.status(200).json({
				result: 'success',
				message: 'succesfully archived lesson',
				data: archiveLesson
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to archive lesson',
				error: e.message
			});
		} 
	}
};

module.exports = LessonController;