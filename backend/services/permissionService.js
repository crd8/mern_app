const { Permission, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getPermissions = async ({ page = 1, pageSize = 10, search = '' }) => {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNum) || pageNum <= 0) throw new Error('Invalid page number');
  if (isNaN(size) || size <= 0) throw new Error('Invalid page size');

  const offset = (pageNum - 1) * size;

  try {
    const { count, rows } = await Permission.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: size,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      totalPages: Math.ceil(count /  size),
      currentPage: pageNum,
    };
  } catch (error) {
    throw new Error('Error fetching permissions: ' + error.message);
  }
};

exports.createPermission = async ({ name, description }) => {
  if (!name) throw new Error('Permission name is required');
  if (!description) throw new Error('Permission decription is required');

  try {
    const existingNamePermission = await Permission.findOne({ where: { name } });
    if (existingNamePermission) {
      throw new Error('Permission name already exists');
    }

    const newPermission = await Permission.create({ name, description });
    return newPermission;
  } catch (error) {
    console.error('Error creating permission: ', error.message);
    throw new Error(error.message);
  }
};