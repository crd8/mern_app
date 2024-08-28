const { Department } = require('../models');
const { Op } = require('sequelize');

exports.getDepartments = async ({ page = 1, pageSize = 10, search = '' }) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Department.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }, 
      ],
    },
    limit: parseInt(pageSize),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });
  return {
    data: rows,
    totalPages: Math.ceil(count / pageSize),
    currentPage: parseInt(page),
  };
};

exports.getDeletedDepartments = async ({ page = 1, pageSize = 5, search = '' }) => {
  const offset = (page - 1) * pageSize;
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
    limit: parseInt(pageSize),
    offset: parseInt(offset),
    order: [['deletedAt', 'DESC']],
  });
  return {
    data: rows,
    totalPages: Math.ceil(count / pageSize),
    currentPage: parseInt(page)
  };
};


exports.getDepartmentById = async (id) => {
  return await Department.findByPk(id);
};

exports.createDepartment = async ({ name, description}) => {
  const existingNameDepartment = await Department.findOne({ where: { name } });
  if (existingNameDepartment) {
    throw new Error('Department name already exist');
  }
  const newDepartment = new Department({ name, description });
  return await newDepartment.save();
};

exports.updateDepartment = async (id, { name, description }) => {
  const existingNameDepartment = await Department.findOne({ where: { name } });
  if (existingNameDepartment) {
    throw new Error('Department name already exist');
  }
  const [updated] = await Department.update({ name, description }, { where: { id } });
  if (updated) {
    return await Department.findByPk(id);
  }
  return null;
};

exports.deleteDepartment = async (id) => {
  return await Department.destroy({ where: { id } });
};

exports.destroyDepartment = async (id) => {
  return await Department.destroy({ where: { id }, force: true });
};