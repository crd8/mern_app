const permissionService = require('../services/permissionService');

exports.getAllPermissions = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const permissions = await permissionService.getPermissions({ page, pageSize, search });
    res.json(permissions);
  } catch (error) {
    console.error('error in get permissions: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: 'Permission name is required' });
    if (!description) return res.status(400).json({ error: 'Permission description is required' });

    const permission = await permissionService.createPermission({ name, description });
    res.status(201).json({ message: 'Permission successfully created', permission });
  } catch (error) {
    if (error.message === 'Permission name already exists') {
      return res.status(400).json({ error: 'Permission name already exists'});
    }
    console.error('Error in created permission: ', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};