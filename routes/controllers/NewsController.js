/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config'); 

/* Model */
const News = require('../../models/News');
const User = require('../../models/Users');

const DailyTipsController = {

	createNews: async (req, res) => {
		// Create News
		let token = req.headers['token'];
		let user, news, decoded, saveNews;

		try {

			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});

		} finally {
			if(!decoded) {
				res.status(401).json({
					message: 'Unauthorized'
				});
			} else if (decoded && user){
				news = new News({
					_id: new mongoose.Types.ObjectId(),
					title: req.body.title,
					description: req.body.description,
					imageUrl: req.body.imageUrl,
					createdBy: user.firstName + ' ' + user.lastName,
					isArchive: false
				});

				saveNews = await news.save();

				if(!saveNews) {
					res.status(500).json({
						message: 'Something went wrong.'
					});	
				} else {
					res.status(200).json({
						message: 'News has been successfully created.'
					});
				}
			} else {
				res.status(500).json({
					message: 'Something went wrong.'
				});	
			}
		}
	},

	getNews: async (req, res) => {
		let token = req.headers['token'];
		let news, user, decoded;

		let query = [{ $match: { createdAt: { $exists: true }} }];
		// Pagination
		// Pagination:
		let count = 0;
		let pageItems = parseInt(config.pagination.defaultItemsPerPage);
		let pageNumber = 1;


		let newBody = {
			pageNumber: 0,
			totalPages: 0,
			itemsPerPage: 0,
			totalItems: 0,
			items: [],
		}

		if (req.query.pageNumber) {
			pageNumber = parseInt(req.query.pageNumber);
		}

		if (req.query.pageItems) {
			pageItems = parseInt(req.query.pageItems);

		}

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id});
			
			// Show only unarchived news on non-admin users
			if (user.isAdmin === false) {
				query.push({ $match: { isArchive: false }});
			}

			count = await News.aggregate(query).sort({"createdAt": -1});
			count = count.length;
			news = await News.aggregate(query).skip(pageItems*(pageNumber-1)).limit(pageItems).sort({"createdAt": -1});
			newBody.pageNumber = parseInt(pageNumber);
            newBody.totalPages = Math.ceil(count / pageItems);
            newBody.itemsPerPage = pageItems;
            newBody.totalItems = count;

            news.forEach((n) => {
				newBody.items.push({
					id: n._id,
					title: n.title,
					dsecription: n.description,
					imageUrl: n.imageUrl,
					createdBy: n.createdBy,
					createdAt: n.createdAt,
					isArchive: n.isArchive
				});
			});
			res.status(200).json(newBody);
		} catch(e) {
			res.status(500).json({
				message: 'Something went wrong.',
				error: e.message
			});
		}
	},

	getNewsDetails: async (req, res) => {

		let news;

		try {
			
			news = await News.findOne({ _id: req.params.newsId });

		} finally {
			if (!news) {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			} else {
				res.status(200).json({
					id: news._id,
					title: news.title,
					description: news.description,
					imageUrl: news.imageUrl,
					createdBy: news.createdBy,
					createdAt: news.createdAt,
					updatedAt: news.updatedAt,
					isArchive: news.isArchive
				});
			}
		}
	},

	updateNews: async (req, res) => {
		let news;
		try {
			news = await News.findOne({ _id: req.params.newsId });
		} finally {
			if(!news) {
				res.status(400).json({
					message: 'News does not exist.'
				});
			} else {
				await News.findOneAndUpdate(
					{ _id: req.params.newsId},
					{ $set: {
						title: req.body.title,
						description: req.body.description,
						imageUrl: req.body.imageUrl,
						updatedAt: Date.now(),
						isArchive: req.body.isArchive,

					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'News details successfuly updated.'
				});
			}
		}
	},

	archiveNews: async (req, res) => {
		let news;
		try {
			news = await News.findOne({ _id: req.params.newsId });
		} finally {
			if(!news) {
				res.status(400).json({
					message: 'News does not exist.'
				});
			} else {
				await News.findOneAndUpdate(
					{ _id: req.params.newsId},
					{ $set: {
						updatedAt: Date.now(),
						isArchive: true,

					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'News details successfuly archived.'
				});
			}
		}
	}
}

module.exports = DailyTipsController;