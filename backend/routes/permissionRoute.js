const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

router.get('/', permissionController.getAllPermissions);
router.post('/', permissionController.createPermission);

module.exports = router;