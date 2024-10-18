const departmentService = require('../services/departmentService');

exports.getAllDepartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', paranoid = true } = req.query;
    const allDepartments = await departmentService.getDepartments({ page, pageSize, search, paranoid: paranoid === 'false' ? false : true });
    res.json(allDepartments);
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDeletedDepartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 5, search = '' } = req.query;
    const deletedDepartments = await departmentService.getDeletedDepartments({ page, pageSize, search });
    res.json(deletedDepartments);
  } catch (error) {
    console.error('Error in getDeletedDepartments:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }
    const department = await departmentService.getDepartmentById(id);
    res.json(department);
  } catch (error) {
    console.error('Error in getDepartmentById: ', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: 'Department description is required' });
    }

    const department = await departmentService.createDepartment({ name: name.trim(), description: description.trim() });
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    if (error.message === 'Department name already exists') {
      return res.status(409).json({ error: 'Department name already exists' });
    }
    console.error('Error in createDepartment:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }
    if (!name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: 'Department description is required' });
    }

    const department = await departmentService.updateDepartment(id, { name, description });

    if (department) {
      res.json({ message: 'Department update successfully', department });
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    const result = await departmentService.deleteDepartment(id);
    if (result.message === 'Department not found') {
      res.status(404).json({ error: result.message });
    } else {
      res.status(200).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.batchDeleteDepartments = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Department IDs are required' });
    }

    const result = await departmentService.batchDeleteDepartments(ids);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting departments:', error.message);
    return res.status(500).json({ message: 'Error deleting selected departments', error: error.message });
  }
};

exports.destroyDepartment = async (req, res) => {
  try {
  
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    const result = await departmentService.destroyDepartment(id);
    if (result) {
      res.status(200).json({ message: 'Department permanently deleted' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    if (error.message === 'Department not found' || error.message === 'Department must be soft deleted first') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error in destroyDepartment:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

exports.restoreDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department id is required' });
    }

    const result = await departmentService.restoreDepartment(id);
    if (result) {
      res.status(200).json({ message: 'Department restored' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error('Error in restoreDepartment:', error);
    res.status(500).json({ error: error.message });
  }
};