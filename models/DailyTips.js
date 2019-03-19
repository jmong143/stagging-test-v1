const mongoose = require('mongoose');

const dailyTips = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   tip: { type: String, required: true,}
});

module.exports = mongoose.model('DailyTips', dailyTips);