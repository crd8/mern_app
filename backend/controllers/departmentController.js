const departmentService = require('../services/departmentService');

exports.getAllDepartments = async (req, res) => {
  try {
    // Validasi parameter query
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const departments = await departmentService.getDepartments({ page, pageSize, search });
    res.json(departments); // Mengembalikan data sebagai JSON
  } catch (error) {
    console.error('Error in getAllDepartments:', error); // Logging kesalahan
    res.status(500).json({ error: error.message });
  }
};

// mengambil department yang dihapus
exports.getDeletedDepartments = async (req, res) => {
  try {
    // validasi parameter query
    const { page = 1, pageSize = 5, search = '' } = req.query;
    const deletedDepartments = await departmentService.getDeletedDepartments({ page, pageSize, search });
    res.json(deletedDepartments); // mengembalikan data sebagai json
  } catch (error) {
    console.error('Error in getDeletedDepartments:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); // mengembalikan status dan pesan kesalahan
  }
};

// mengambil department berdasarkan ID
exports.getDepartmentById = async (req, res) => {
  try {
    // validasi ID department
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' }); // validasi ID
    }

    const department = await departmentService.getDepartmentById(id);
    if (department) {
      res.json(department); // mengembalikan data sebagai JSON
    } else {
      res.status(404).json({ error: 'Department not found' }); // menangani kasus jika department tidak ditemukan
    }
  } catch (error) {
    console.error('Error in getDepartmentById:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); // mengembalikan status dan pesan kesalahan
  }
};

// membuat department baru
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // validasi input
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' }); // validasi nama
    }
    if (!description) {
      return res.status(400).json({ error: 'Department description is required' }); // validasi deskripsi
    }

    const department = await departmentService.createDepartment({ name, description });
    res.status(201).json(department); // mengembalikan data department baru sebagai json
  } catch (error) {
    if (error.message === 'Department name already exists') {
      return res.status(400).json({ error: 'Department name already exists' });
    }
    console.error('Error in createDepartment:', error); // logging kesalahan
    res.status(500).json({ error: 'An unexpected error occurred' }); // Mengembalikan status dan pesan kesalahan
  }
};

// memperbarui department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    // validasi input
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' }); // validasi id
    }
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' }); // validasi name
    }
    if (!description) {
      return res.status(400).json({ error: 'Department description is required' }); // validasi deskripsi
    }

    const department = await departmentService.updateDepartment(id, { name, description });
    if (department) {
      res.json(department); // Mengembalikan data departemen yang diperbarui sebagai JSON
    } else {
      res.status(404).json({ error: 'Department not found' }); // Menangani kasus jika departemen tidak ditemukan
    }
  } catch (error) {
    console.error('Error in updateDepartment:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); //mengembalikan status dan pesan kesalahan
  }
};

// menghapus department (soft-delete)
exports.deleteDepartment = async (req, res) => {
  try {
    // validasi ID
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' }); // validasi ID
    }

    const result = await departmentService.deleteDepartment(id);
    if (result) {
      res.status(200).json({ message: 'Department deleted' }); // Mengembalikan pesan sukses
    } else {
      res.status(404).json({ error: 'Department not found' }); // Menangani kasus jika departemen tidak ditemukan
    }
  } catch (error) {
    console.error('Error in deleteDepartment:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); // mengembalikan status dan pesan kesalahan
  }
};

// menghapus department secara permanen
exports.destroyDepartment = async (req, res) => {
  try {
    // validasi ID
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' }); // validasi ID
    }

    const result = await departmentService.destroyDepartment(id);
    if (result) {
      res.status(200).json({ message: 'Department permanently deleted' }); // Mengembalikan pesan sukses
    } else {
      res.status(404).json({ error: 'Department not found' }); // Menangani kasus jika departemen tidak ditemukan
    }
  } catch (error) {
    console.error('Error in destroyDepartment:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); // mengembalikan status dan pesan kesalahan
  }
};