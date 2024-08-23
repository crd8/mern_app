const departmentService = require('../services/departmentService');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getDepartments(req.query);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = await departmentService.createDepartment({ name, description });
    res.status(201).json(department);
  } catch (error) {
    if (error.message === 'Department name already exist') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = await departmentService.updateDepartment(req.params.id, { name, description });
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const result = await departmentService.deleteDepartment(req.params.id);
    if (result) {
      res.status(200).json({ message: 'Department deleted' });
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};