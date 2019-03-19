const mongoose = require('mongoose');

const subjectCode = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   subjectCode: { type: String, required: true,  index: { unique : true, dropDups: true } },
   userId: { type: String, required: false,  index: { unique : true, dropDups: true } },
   createdAt: { type: Date, default: Date.now },
   activatedAt: { type: Date },
   expiresAt: { type: Date },
   subjects: { type: Array, required: true }
});

module.exports = mongoose.model('SubjectCode', subjectCode);