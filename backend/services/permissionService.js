const { Permission } = require('../models');
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

exports.getDeletedPermissions = async ({ page = 1, pageSize = 10, search = '' }) => {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNum) || pageNum <= 0) throw new Error('Invalid page number');
  if (isNaN(size) || size <= 0) throw new Error('Invalid page size');

  const offset = (pageNum - 1) * size;

  try {
    const { count, rows } = await Permission.findAndCountAll({
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
      order: [['deletedAt', 'DESC']]
    });

    return {
      data: rows,
      totalPages: Math.ceil(count / size),
      currentPage: pageNum
    };
  } catch (error) {
    throw new Error('Error fetching deleted permissions: ' + error.message);
  }
};

exports.getPermissionById = async (id) => {
  if (!id) throw new Error('Permission ID is required');

  try {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    return permission;
  } catch (error) {
    throw new Error('Error fetching permission: ' + error.message);
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

exports.updatePermission = async (id, { name, description }) => {
  if (!id) throw new Error('Permission ID is required');
  if (!name) throw new Error('Permission name is required');
  if (!description) throw new Error('Permission description is required');

  try {
    const [updated] = await Permission.update({ name, description }, { where: { id } });
    if (updated) return await Permission.findByPk(id);
    throw new Error('Permission not found');
  } catch (error) {
    throw new Error('Error updating permission: ' + error.message);
  }
};

exports.deletePermission = async (id) => {
  if (!id) throw new Error('Permission ID is required');

  try {
    const deleted = await Permission.destroy({ where: { id } });
    if (deleted === 0) return { message: 'Permission not found', status: 404 };
    return { message: 'Permission successfully deleted', status: 200 };
  } catch (error) {
    console.error('Error deleting permission: ', error.message);
    throw new Error('Error deleting permission: ' + error.message);
  }
};

exports.destroyPermission = async (id) => {
  if (!id) throw new Error('Permission ID is required');

  try {
    const permission = await Permission.findOne({ where: { id }, paranoid: false });
    
    if (!permission) throw new Error('Permission not found');
    if (!permission.deletedAt) throw new Error('Permission must be soft deleted firts');

    const destroyed = await Permission.destroy({ where: { id }, force: true });
    return destroyed;
  } catch (error) {
    console.error('Error permanently deleting permission: ', error.message);
    throw new Error(error.message);
  }
};

exports.restorePermission = async (id) => {
  if (!id) throw new Error('Permission ID is required');

  try {
    const restored = await Permission.restore({ where: { id } });
    if (!restored) throw new Error('Permission not found');
    return restored;
  } catch (error) {
    throw new Error('Error restoring permission: ' + error.message);
  }
};