const mongoose = require('mongoose');

const auditTrail = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId: mongoose.Schema.Types.ObjectId,
   email: { type: String, required: true },
   module: { type: String, required: true }, 
   action: { type: String, required: true},
   details: { type: Object, required: true },
   date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('auditTrail', auditTrail);