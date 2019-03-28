const mongoose = require('mongoose');

const topic = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   description: { type: String },
   topicNumber: { type: Number, required: true },
   subjectId : { type: String, required: true },
   createdAt: { type: Date, default: Date.now },
   isArchive: { type: Boolean, default: false }
});

module.exports = mongoose.model('Topic', topic);