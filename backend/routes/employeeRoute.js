const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAllEmployees);
router.get('/deleted-employees', employeeController.getAllDeletedEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.delete('/:id/destroy', employeeController.destroyEmployee);
router.put('/:id/restore', employeeController.restoreEmployee);

module.exports = router;