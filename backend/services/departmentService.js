const { Department } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { stack } = require('sequelize/lib/utils');

exports.getDepartments = async ({ page = 1, pageSize = 10, search = '', paranoid = true }) => {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  
  if (isNaN(pageNum) || pageNum <= 0) throw { message: 'Invalid page number', statusCode: 400 };
  if (isNaN(size) || size <= 0) throw { message: 'Invalid page size', statusCode: 400}

  const offset = (pageNum - 1) * size;
  try {
  
    const { count, rows } = await Department.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: size,
      offset: offset,
      order: [['createdAt', 'DESC']],
      paranoid: paranoid
    });
    
    return {
      data: rows,
      totalPages: Math.ceil(count / size),
      currentPage: pageNum,
    };
  } catch (error) {
    logger.error('Error retrieving departments: ', error.message);
    throw { message: 'Error retrieving departments', statusCode: 500 };
  }
};

exports.getDeletedDepartments = async ({ page = 1, pageSize = 10, search = '' }) => {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);

  if (isNaN(pageNum) || pageNum <= 0) throw { message: 'Invalid page number', statusCode: 400 };
  if (isNaN(size) || size <= 0) throw { message: 'Invalid page size', statusCode: 400 };

  const offset = (pageNum - 1) * size;

  try {
    const { count, rows } = await Department.findAndCountAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.not]: null } },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { description: { [Op.like]: `%${search}%` } },
            ]
          }
        ]
      },
      paranoid: false,
      limit: size,
      offset: offset,
      order: [['deletedAt', 'DESC']],
    });
  
    return {
      data: rows,
      totalPages: Math.ceil(count / size),
      currentPage: pageNum
    };
  } catch (error) {
    logger.error('Error retrieving deleted departments: ', error.message);
    throw { message: 'Error retrieving deleted departments', statusCode: 500 };
  }
};

exports.getDepartmentById = async (id) => {
  if (!id) throw { message: 'Department ID is required', statusCode: 400 };
  try {
    const department = await Department.findByPk(id);
    if (!department) throw { message: 'Department not found', statusCode: 404 };
    return department;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    } else {
      logger.error('Error retrieving department by ID: ', { message: error.message, stack: error.stack });
      throw { message: 'Error retrieving department: ' + error.message, statusCode: 500 };
    }
  }
};



exports.createDepartment = async ({ name, description}) => {
  if (!name.trim()) throw { message: 'Department name is required', statusCode: 400 };
  if (!description.trim()) throw { message: 'Department description is required', statusCode: 400 };
  
  try {
    const existingNameDepartment  = await Department.findOne({ where: { name: name.trim() } });
    
    if (existingNameDepartment) {
      throw { message: 'Department name already exists', statusCode: 409 };
    }
    const newDepartment = await Department.create({ name: name.trim(), description: description.trim() });
    return newDepartment;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    } else {
      logger.error('Error creating new department: ', { message: error.message, stack: error.stack });
      throw { message: 'Error creating new department: ' + error.message, statusCode: 500 };
    }
  }
};

exports.updateDepartment = async (id, { name, description }) => {
  if (!id) throw { message: 'Department ID is required', statusCode : 400 };
  if (!name.trim()) throw { message: 'Department name is required', statusCode: 400 };
  if (!description.trim()) throw { message: 'Department description is required', statusCode: 400 };
  try {
    const [updated] = await Department.update({ name: name.trim(), description: description.trim() }, { where: { id } });
    if (updated) {
      return await Department.findByPk(id);
    }
    throw { message: 'Department not found', statusCode: 404 };
  } catch (error) {
    logger.error('Error updating department: ', { message: error.message, stack: error.stack });
    throw { message: 'Error updating department: ' + error.message, statusCode: error.statusCode || 500 };
  }
};


exports.deleteDepartment = async (id) => {
  if (!id) throw { message: 'Department ID is required', statusCode: 400 };
  try {
    const deleted = await Department.destroy({ where: { id } });
    if (deleted === 0) {
      return { message: 'Department not founda', status: 404 };
    }
    return { message: 'Department deleted', status: 200 };
  } catch (error) {
    logger.error('Error deleting department: ', { message: error.message, stack: error.stack });
    throw { message: 'Error deleting department: '+ error.message, statusCode: error.statusCode || 500 };
  }
};

exports.batchDeleteDepartments = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw { message: 'Department IDs must be an array and cannot be empty', statusCode: 400 };
  }
  try {
    const deleted = await Department.destroy({
      where: {
        id: ids,
        deletedAt: null
      }
    });

    if (deleted === 0) {
      console.warn('No departments were deleted - possibly already deleted or not found.');
      return { message: 'No departments were deleted - possibly already deleted or not found.', statusCode: 404 };
    }
    return { message: 'Selected departments deleted successfully', statusCode: 200 };
  } catch (error) {
    logger.error('Error deleting departments: ', error.message);
    throw { message: 'Error deleting selected departments' + error.message, statusCode: 500 };
  }
};

exports.destroyDepartment = async (id) => {
  if (!id) throw { message: 'Department ID is required', statusCode: 400 };
  try {
    const department = await Department.findOne({ where: {id}, paranoid: false }); 

    if (!department) throw { message: 'Department not found', statusCode: 404 };
    if (!department.deletedAt) throw { message: 'Department must be soft deleted first', statusCode: 400 };

    const destroyed = await Department.destroy({ where: { id }, force: true });
    return destroyed;
  } catch (error) {
    logger.error('Error permanently deleting department: ', error.message);
    throw { message: 'Error permanently deleting department: ' + error.message, statusCode: error.statusCode || 500 };
  }
};

exports.restoreDepartment = async (id) => {
  if (!id) throw { message: 'Department ID is required', statusCode: 400 };
  try {
    const restored = await Department.restore({ where: { id }});
    if (!restored) throw { message: 'Department not found', statusCode: 404 };
    return restored;
  } catch (error) {
    logger.error('Error restoring department: ', error.message);
    throw { message: 'Error restoring department', statusCode: 500 };
  }
};