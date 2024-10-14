const departmentService = require('../services/departmentService');

// Controller untuk mengambil semua permissions
// Mengambil parameter 'paranoid' dari query untuk menentukan
// apakah ingin menyertakan data yang telah dihapus (soft delete).
// Defaultnya adalah true, yang berarti hanya data aktif yang diambil.
exports.getAllDepartments = async (req, res) => {
  try {
    // Validasi parameter query
    const { page = 1, pageSize = 10, search = '', paranoid = true } = req.query;
    const departments = await departmentService.getDepartments({ page, pageSize, search, paranoid: paranoid === 'false' ? false : true });
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
    res.status(201).json({ message: 'Department created successfully', department }); // mengembalikan data department baru sebagai json
  } catch (error) {
    if (error.message === 'Department name already exists') { // Sesuaikan dengan pesan dari service
      return res.status(400).json({ error: 'Department name already exists' });
    }
    console.error('Error in createDepartment:', error.message); // logging kesalahan
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
      res.json({ message: 'Department update successfully', department }); // Mengembalikan data departemen yang diperbarui sebagai JSON
    } else {
      res.status(404).json({ error: 'Department not found' }); // Menangani kasus jika departemen tidak ditemukan
    }
  } catch (error) {
    console.error('Error in updateDepartment:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); //mengembalikan status dan pesan kesalahan
  }
};

// Menghapus departemen (soft-delete)
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Department ID is required' }); // Validasi ID
    }

    const result = await departmentService.deleteDepartment(id);
    if (result.message === 'Department not found') {
      res.status(404).json({ error: result.message }); // Menangani kasus jika departemen tidak ditemukan
    } else {
      res.status(200).json({ message: result.message }); // Mengembalikan pesan sukses
    }
  } catch (error) {
    console.error('Error in deleteDepartment:', error); // Logging kesalahan
    res.status(500).json({ error: error.message }); // Mengembalikan status dan pesan kesalahan
  }
};

// Controller untuk batch delete departemen
exports.batchDeleteDepartments = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'Department IDs are required' });
    }

    const result = await departmentService.batchDeleteDepartments(ids);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting departments:', error.message);
    return res.status(500).json({ message: 'Error deleting selected departments', error: error.message });
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
      res.status(200).json({ message: 'Department permanently deleted' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    if (error.message === 'Department not found' || error.message === 'Department must be soft deleted first') {
      return res.status(400).json({ error: error.message }); // mengembalikan pesan error
    }
    console.error('Error in destroyDepartment:', error.message); // logging kesalahan
    res.status(500).json({ error: 'An unexpected error occurred' }); // mengembalikan status dan pesan kesalahan
  }
};

// memulihkan department yang terhapus (restore)
exports.restoreDepartment = async (req, res) => {
  try {
    const { id } = req.params; // validasi ID
    if (!id) {
      return res.status(400).json({ error: 'Department id is required' }); // validasi ID
    }

    const result = await departmentService.restoreDepartment(id);
    if (result) {
      res.status(200).json({ message: 'Department restored' }); // mengembalikan pesan sukses
    } else {
      res.status(404).json({ message: 'Department not found' }); // menangani kasus jika ID tidak ditemukan
    }
  } catch (error) {
    console.error('Error in restoreDapartment:', error); // logging kesalahan
    res.status(500).json({ error: error.message }); // mengembalikan status dan pesan kesalahan
  }
};