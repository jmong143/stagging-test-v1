const mongoose = require('mongoose');

const lesson = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   name: { type: String, required: true },
   content: { type: String },
   topicId: { type: String, required: true },
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date },
   isArchive: { type: Boolean, default: false }
});

module.exports = mongoose.model('lesson', lesson);