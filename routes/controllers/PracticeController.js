/* Dependencies */
const mongoose = require('mongoose');

/* Models */
const Question = require('../../models/Question');
const Lesson = require('../../models/Lesson');
const Topic = require('../../models/Topic');

const PracticeController = {

	generatePractice: async (req,res) => {
		let questions, topic;
		let response = [];
		
		try {
			topic = await Topic.find({ _id: req.params.topicId });
			questions = await Question.aggregate([
				{ $match: { topicId: req.params.topicId }},
				{ $sample: { size: 10 }}
			]);
			
			questions.forEach((question) => {
				response.push({
					id: question._id,
					question: question.question,
					choices: question.choices,
					answer: question.answer,
					topicId: question.topicId,
					difficulty: question.difficulty,
					resourceUrl: question.resourceUrl
				});
			});

			res.status(200).json(response);

		} catch (e) {
			res.status(400).json({
				message: 'Failed to get practice questions.',
				error: e.message
			})
		}
	}
}


module.exports = PracticeController;