const express = require('express');
const contactController = require('../controllers/contact.controller');

const router = express.Router();

router.get('/contacts/with-project-roles', contactController.getContactsWithProjectRoles);

module.exports = router;