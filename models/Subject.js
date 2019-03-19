const mongoose = require('mongoose');

const subject = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   code: { type: String, required: true,  index: { unique : true, dropDups: true } },
   name: { type: String, required: true,  index: { unique : true, dropDups: true } },
   createdAt: { type: Date, default: Date.now },
   description: { type: String }
});

module.exports = mongoose.model('Subject', subject);