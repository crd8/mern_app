const { Department } = require('../models');
const { Op } = require('sequelize');

// mengambil data department yang active
exports.getDepartments = async ({ page = 1, pageSize = 10, search = '' }) => { // parameter paginasi dan pencarian
  // valiasi input untuk memastikan halaman dan ukuran halaman adalah angka valid dan positif
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNum) || pageNum <= 0) throw new Error('Invalid page number');
  if (isNaN(size) || size <= 0) throw new Error('Invalid page size');

  // menghitung offset untuk paginasi
  const offset = (pageNum - 1) * size;
  
  // menggunakan try-catch untuk menangani kemungkinan kesalahan yang terjadi
  // selama proses pengembalian, pembaruan, penghapusan
  try {
    // mengambil data dan jumlah total department berdasarkan kondisi pencarian
    const { count, rows } = await Department.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } }, // mencari berdasarkan nama
          { description: { [Op.like]: `%${search}%` } }, // mencari berdasarkan deskripsi
        ],
      },
      limit: size, // mengatur batas jumlah data per halaman
      offset: offset, // mengatur data yang akan dilewati
      order: [['createdAt', 'DESC']], // mengurutkan hasil berdasarkan tanggal createdAt
    });
    
    // mengembalikan data dengan informasi paginasi
    return {
      data: rows,
      totalPages: Math.ceil(count / size), // menghitung total halaman
      currentPage: pageNum, // halaman saat ini
    };
  } catch (error) {
    throw new Error('Error retrieving departments: ' + error.message); // menangani kesalahan
  }
};

// mengambil data department yang non aktif atau softdelete
exports.getDeletedDepartments = async ({ page = 1, pageSize = 5, search = '' }) => { // parameter paginasi dan pencarian
  // valiasi input untuk memastikan halaman dan ukuran halaman adalah angka valid dan positif
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNum) || pageNum <= 0) throw new Error('Invalid page number');
  if (isNaN(size) || size <= 0) throw new Error('Invalid page size');

  // menghitung offset untuk paginasi
  const offset = (pageNum - 1) * size;

  // menggunakan try-catch untuk menangani kemungkinan kesalahan yang terjadi
  // selama proses pengembalian, pembaruan, penghapusan
  try {
    // mengambil data dan jumlah total department berdasarkan kondisi pencarian
    const { count, rows } = await Department.findAndCountAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.not]: null } }, // Mencari departemen yang dihapus
          {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } }, // mencari berdasarkan nama
              { description: { [Op.like]: `%${search}%` } }, // mencari berdasarkan deskripsi
            ]
          }
        ]
      },
      paranoid: false, // Mengizinkan pencarian pada data yang dihapus
      limit: size, // mengatur batas jumlah data per halaman
      offset: offset, // Mengatur data yang akan dilewati
      order: [['deletedAt', 'DESC']], // Mengurutkan hasil berdasarkan tanggal penghapusan terbaru
    });

    // Mengembalikan data dengan informasi paginasi
    return {
      data: rows,
      totalPages: Math.ceil(count / size), // Menghitung total halaman
      currentPage: pageNum // Halaman saat ini
    };
  } catch (error) {
    throw new Error('Error retrieving deleted departments: ' + error.message);
  }
};

// Mengambil data departemen berdasarkan ID
exports.getDepartmentById = async (id) => {
  if (!id) throw new Error('Department ID is required'); // Validasi ID

  try {
    // Mengambil data departemen berdasarkan ID
    const department = await Department.findByPk(id); 
    if (!department) throw new Error('Department not found'); // Menangani kasus jika tidak ditemukan
    return department;
  } catch (error) {
    throw new Error('Error retrieving department: ' + error.message); // Menangani kesalahan
  }
};

// Membuat departemen baru
exports.createDepartment = async ({ name, description}) => {
  if (!name) throw new Error('Department name is required'); // Validasi nama

  try {
    // Memeriksa apakah nama departemen sudah ada
    const existingNameDepartment = await Department.findOne({ where: { name } }); // memeriksa apakah nama sudah ada pada db
    if (existingNameDepartment) {
      throw new Error('Department name already exist'); // Menangani kasus nama sudah ada
    }
    
    // Membuat departemen baru
    const newDepartment = await Department.create({ name, description });
    return newDepartment;
  } catch (error) {
    throw new Error('Error creating department: ' + error.message); // Menangani kesalahan
  }
};

// Memperbarui departemen berdasarkan ID
exports.updateDepartment = async (id, { name, description }) => {
  if (!id) throw new Error('Department ID is required'); // validasi ID
  if (!name) throw new Error('Department name is required'); // validasi name

  try {
    // Memeriksa apakah nama departemen sudah ada
    const existingNameDepartment = await Department.findOne({ where: { name } });
    if (existingNameDepartment) {
      throw new Error('Department name already exist'); // Menangani kasus nama sudah ada
    }

    // Memperbarui departemen berdasarkan ID
    const [updated] = await Department.update({ name, description }, { where: { id } });
    if (updated) {
      return await Department.findByPk(id); // Mengembalikan data departemen yang diperbarui
    }
    throw new Error('Department not found'); // Menangani kasus jika tidak ditemukan
  } catch (error) {
    throw new Error('Error updating department: '+ error.message); // Menangani kesalahan
  }
};


// Menghapus departemen (soft delete)
exports.deleteDepartment = async (id) => {
  if (!id) throw new Error('Department ID is required'); // validasi ID

  try {
    // Menghapus departemen (soft delete) jika paranoid = true di model
    const deleted = await Department.destroy({ where: { id } });
    if (deleted === 0) throw new Error('Department not found'); // Menangani kasus jika tidak ditemukan
    return deleted;
  } catch (error) {
    throw new Error('Error deleting department: ' + error.message); // Menangani kesalahan
  }
};

// Menghapus departemen secara permanen (hard delete)
exports.destroyDepartment = async (id) => {
  if (!id) throw new Error('Department ID is required'); // validasi ID

  try {
    // Menghapus departemen secara permanen
    const destroyed = await Department.destroy({ where: { id }, force: true }); // menghapus secara hard delete atau permanent
    if (destroyed === 0) throw new Error('Department not found'); // Menangani kasus jika tidak ditemukan
    return destroyed;
  } catch (error) {
    throw new Error('Error permanently deleting department: ' + error.message); // Menangani kesalahan
  }
};