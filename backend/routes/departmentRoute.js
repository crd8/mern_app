const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Mendefinisikan route untuk mengambil semua department yang aktif
router.get('/', departmentController.getAllDepartments);

// Mendefinisikan route untuk mengambil semua department yang sudah dihapus
router.get('/deleted-departments', departmentController.getDeletedDepartments);

// Mendefinisikan route untuk mengambil department berdasarkan ID
router.get('/:id', departmentController.getDepartmentById);

// Mendefinisikan route untuk membuat department baru
router.post('/', departmentController.createDepartment);

// Mendefinisikan route untuk memperbarui department berdasarkan ID
router.put('/:id', departmentController.updateDepartment);

// Mendefinisikan route untuk menghapus department (soft delete) berdasarkan ID
router.delete('/:id', departmentController.deleteDepartment);

// Mendefinisikan route untuk menghapus department (soft delete) berdasarkan ID yang terselected
router.post('/batch-delete', departmentController.batchDeleteDepartments);

// Mendefinisikan route untuk menghapus department secara permanen berdasarkan ID
router.delete('/:id/destroy', departmentController.destroyDepartment);

// Mendefinisikan route untuk restore department berdasarkan ID
router.put('/:id/restore', departmentController.restoreDepartment);

module.exports = router; // mengekspor route agar bisa digunakan difile lain