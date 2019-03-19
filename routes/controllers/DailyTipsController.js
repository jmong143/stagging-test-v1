//Model
const DailyTips = require('../../models/DailyTips');
const mongoose = require('mongoose');

const DailyTipsController = {

	createDailyTips: function (req, res) {
		// Create new Subject
		const _dailyTips = new DailyTips ({
			_id: new mongoose.Types.ObjectId(),
			tip: req.body.tip
		});

		_dailyTips.save().then(function (result) {
			res.status(200).json({
				message: 'New Daily Tips has been added.'
			});
		}, function (err) {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	},

	getTips: function (req, res) {
		DailyTips.find().exec(function(err, tips) {
			let newBody = {
				tips: [],
				total: tips.length
			};
			tips.forEach((tip)=>{
				newBody.tips.push({
					id: tip._id,
					tip: tip.tip
				});
			});
			res.status(200).json(newBody);
		});
	},

	getDailyTips: function (req, res) {
		DailyTips.aggregate([ { $sample: {size: 1} }]).exec(function(err, tip) {
			let newBody = {
				id: tip[0]._id,
				tip: tip[0].tip
			};
			res.status(200).json(newBody);
		});
	},

	updateDailyTips: function (req, res) {
		// Update Daily Tips
	}
}

module.exports = DailyTipsController;