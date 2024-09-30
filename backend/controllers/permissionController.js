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

exports.getAllDeletedPermissions = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const deletedPermissions = await permissionService.getDeletedPermissions({ page, pageSize, search });
    res.json(deletedPermissions);
  } catch (error) {
    console.error('Error in get deleted permissions: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Permission ID is required' });

    const permission = await permissionService.getPermissionById(id);
    if (permission) {
      res.json(permission);
    } else {
      res.status(404).json({ error: 'Permission not found' });
    }
  } catch (error) {
    console.error('Error in get permission by id: ', error);
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

exports.updatePermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Permission ID is required' });
    if (!name) return res.status(400).json({ error: 'Permission name is required' });
    if (!description) return res.status(400).json({ error: 'Permission description is required' });

    const permission = await permissionService.updatePermission(id, { name, description });
    if (permission) {
      res.json({ message: 'Permission successfully updated', permission });
    } else {
      res.status(404).json({ error: 'Permission not found' });
    }
  } catch (error) {
    console.error('Error in update permission: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Permission ID is required' });

    const result = await permissionService.deletePermission(id);
    if (result.message === 'Permission not found') {
      res.status(404).json({ error: result.message });
    } else {
      res.status(200).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in delete permission: ', error);
    res.status(500).json({ error: error.message });
  }
}

exports.destroyPermission = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Permission ID is required' });

    const result = await permissionService.destroyPermission(id);
    if (result) {
      res.status(200).json({ message: 'Permission successfully permanently deleted' });
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    if (error.message === 'Permission not found' || error.message === 'Permission must be soft deleted firts') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error in destroyed permission: ', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

exports.restorePermission = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Permission ID is required' });

    const result = await permissionService.restorePermission(id);
    if (result) {
      res.status(200).json({ message: 'Permission successfully restored' });
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    console.error('Error in restore permission: ', error);
    res.status(500).json({ error: error.message });
  }
};