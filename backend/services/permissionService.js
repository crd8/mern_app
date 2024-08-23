const { Permission } = require('../models');
const { Op } = require('sequelize');

exports.getPermissions = async ({ page = 1, pageSize = 10, search = '' }) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Permission.findAndCountAll({
    where: {
      [Op.or]: [
        { name : { [Op.like]: `%${search}%` } },
        { description : { [Op.like]: `%${search}%` } },
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

exports.getPermissionById = async (id) => {
  return await Permission.findByPk(id);
};

exports.createPermission = async ({name, description}) => {
  const existingNamePermission = await Permission.findOne({ where: { name }});
  if (existingNamePermission) {
    throw new Error('Permission name already exist');
  }

  return await Permission.create({ name, description });
}