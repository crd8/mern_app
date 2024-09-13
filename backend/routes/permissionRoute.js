const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

router.get('/', permissionController.getAllPermissions);
router.get('/deleted-permissions', permissionController.getAllDeletedPermissions);
router.get('/:id', permissionController.getPermissionById);
router.post('/', permissionController.createPermission);
router.put('/:id', permissionController.updatePermission);
router.delete('/:id', permissionController.deletePermission);
router.delete('/:id/destroy', permissionController.destroyPermission);
router.put('/:id/restore', permissionController.restorePermission);

module.exports = router;