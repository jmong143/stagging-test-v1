const mongoose = require('mongoose');

const user = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   email: { type: String, required: true, index: { unique : true, dropDups: true } },
   password: { type: String, required: true },
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   subjectCode: {type: String, default: "" },
   isAdmin: {type: Boolean, required: true },
   createdAt: {type: Date, default: Date.now },
   isActive: {type: Boolean, default: true}
});

module.exports = mongoose.model('User', user);