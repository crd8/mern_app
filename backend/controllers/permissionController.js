const permissionService = require('../services/permissionService');

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await permissionService.getPermissions(req.query);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPermissionById = async (req, res) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    if (permission) {
      res.json(permission);
    } else {
      res.status(404).json({ error: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    const permission = await permissionService.createPermission({ name, description });
    res.status(201).json(permission);
  } catch (error) {
    if (error.message === 'Permission name already exist') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};