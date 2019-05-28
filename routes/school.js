const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SchoolController = require('./controllers/SchoolController');

/* School Management */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, SchoolController.addSchools);
router.put('/:schoolId', SessionController.validateApp, SessionController.validateAdminToken, SchoolController.updateSchool);

/* Schools - Front & Admin */
router.get('/', SessionController.validateApp, SchoolController.getSchools);


module.exports = router;