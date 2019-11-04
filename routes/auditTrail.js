/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const AuditTrailController = require('./controllers/AuditTrailController');
const SessionController = require('./controllers/SessionController');

/* Audit Trail - Admin */
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, AuditTrailController.getAuditTrail);

module.exports = router;