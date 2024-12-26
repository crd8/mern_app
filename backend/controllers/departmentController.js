const departmentService = require('../services/departmentService');
const excelService = require('../services/excelService');

exports.getAllDepartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', paranoid = true, all = 'false' } = req.query;
    const isParanoid = paranoid === 'false' ? false : true;

    if (all === 'true') {
      const allDepartments = await departmentService.getAllDepartments({ paranoid: isParanoid });
      return res.json(allDepartments);
    } else {
      const paginatedDepartments = await departmentService.getDepartments({ page, pageSize, search, paranoid: isParanoid });
      return res.json(paginatedDepartments);
    }    
  } catch (error) {
    console.error('Error in getAllDepartments: ', error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getDeletedDepartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const deletedDepartments = await departmentService.getDeletedDepartments({ page, pageSize, search });
    
    return res.json(deletedDepartments);
  } catch (error) {
    console.error('Error in getDeletedDepartments: ', error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    const department = await departmentService.getDepartmentById(id);
    return res.json(department);
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
    res.status(201).json({ message: 'Department successfully created', department });
  } catch (error) {
    console.error('Error in createDepartment: ', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: 'Department description is required' });
    }
    
    const { id } = req.params;
    
    const department = await departmentService.updateDepartment(id, { name, description });

    if (department) {
      return res.status(200).json({ message: 'Department update successfully', department });
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    console.error('Error in updateDepartment: ', error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    const result = await departmentService.deleteDepartment(id);

    if (result.status === 404) {
      res.status(404).json({ error: result.message });
    } 
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in deleteDepartment: ', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.batchDeleteDepartments = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Department IDs are required' });
    }

    const result = await departmentService.batchDeleteDepartments(ids);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
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
    if (error.message === 'Department not found') return res.status(404).json({ notification: error.message });
    if (error.message === 'Department must be soft deleted first') return res.status(400).json({ notification: error.message });
    
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
    console.error('Error in restoreDepartment: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.batchRestoreDepartments = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Department IDs are required' });
    }

    const result = await departmentService.batchRestoreDepartments(ids);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error restoring departments: ', error.message);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.downloadDepartmentsExcel = async (req, res) => {
  try {
    const { paranoid = 'true' } = req.query;
    const isParanoid = paranoid === 'false' ? false : true;

    const departments = await departmentService.getAllDepartments({ paranoid: isParanoid });
    const departmentData = departments.data.map(dept => ({
      ID: dept.id,
      Name: dept.name,
      Description: dept.description,
      CreatedAt: dept.createdAt,
      UpdatedAt: dept.updatedAt,
      DeletedAt: dept.deletedAt || null,
    }));

    const excelBuffer = excelService.createExcelFile(departmentData);

    res.setHeader('Content-Disposition', 'attachment; filename="departments.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(excelBuffer);
  } catch (error) {
    console.error('Error in downloadDepartmentsExcel: ', error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};