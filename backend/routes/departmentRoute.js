const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getAllDepartments);
router.get('/deleted-departments', departmentController.getDeletedDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);
router.post('/batch-delete', departmentController.batchDeleteDepartments);
router.post('/batch-restore', departmentController.batchRestoreDepartments);
router.delete('/:id/destroy', departmentController.destroyDepartment);
router.put('/:id/restore', departmentController.restoreDepartment);
router.get('/download/excel', departmentController.downloadDepartmentsExcel);

module.exports = router;