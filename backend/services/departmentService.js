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
  if (!description) throw new Error('Department description is required'); // Validasi description

  try {
    // Memeriksa apakah nama departemen sudah ada
    const existingNameDepartment  = await Department.findOne({ where: { name } }); // memeriksa apakah nama sudah ada pada db
    if (existingNameDepartment) {
      throw new Error('Department name already exists'); // Menangani kasus nama sudah ada
    }
    
    // Membuat departemen baru
    const newDepartment = await Department.create({ name, description });
    return newDepartment;
  } catch (error) {
    console.error('Error creating department:', error.message); // Logging kesalahan
    throw new Error(error.message); // Menangani kesalahan
  }
};

// Memperbarui departemen berdasarkan ID
exports.updateDepartment = async (id, { name, description }) => {
  if (!id) throw new Error('Department ID is required'); // validasi ID
  if (!name) throw new Error('Department name is required'); // validasi name
  if (!description) throw new Error('Department description is required'); // validasi name

  try {
    // // Memeriksa apakah nama departemen sudah ada
    // const existingNameDepartment = await Department.findOne({ where: { name } });
    // if (existingNameDepartment) {
    //   throw new Error('Department name already exist'); // Menangani kasus nama sudah ada
    // }

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
    if (deleted === 0) {
      return { message: 'Department not found', status: 404 };
    }
    return { message: 'Department deleted', status: 200 };
  } catch (error) {
    console.error('Error deleting department:', error.message); // Log error untuk debugging
    throw new Error('Error deleting department: ' + error.message); // Menangani kesalahan
  }
};

// menghapus department secara batch delete
exports.batchDeleteDepartments = async (ids) => {
  console.log('IDs to delete:', ids); // Debugging log

  if (!ids || ids.length === 0) throw new Error('Department IDs are required');

  try {
    // Menghapus departemen (soft delete) jika paranoid = true di model
    const deleted = await Department.destroy({
      where: {
        id: ids,
        deletedAt: null // Tambahkan kondisi ini untuk memastikan hanya yang belum terhapus yang dihapus
      }
    });

    if (deleted === 0) {
      console.warn('No departments were deleted - possibly already deleted or not found.');
      return { message: 'No departments were deleted - possibly already deleted or not found.' };
    }
    
    return { message: 'Selected departments deleted successfully' };
  } catch (error) {
    console.error('Error deleting departments:', error.message);
    throw new Error('Error deleting selected departments: ' + error.message);
  }
};

// Menghapus departemen secara permanen (hard delete)
exports.destroyDepartment = async (id) => {
  if (!id) throw new Error('Department ID is required'); // validasi ID

  try {
    // cari department terlebih dahulu
    const department = await Department.findOne({ where: {id}, paranoid: false });
    // jika tidak ditemukan, lempar error
    if (!department) throw new Error('Department not found');

    // Periksa apakah deletedAt sudah terisi
    if (!department.deletedAt) throw new Error('Department must be soft deleted first');

    // Menghapus departemen secara permanen
    const destroyed = await Department.destroy({ where: { id }, force: true }); // menghapus secara hard delete atau permanent
    return destroyed;
  } catch (error) {
    console.error('Error permanently deleting department:', error.message);
    throw new Error(error.message); // Menangani kesalahan
  }
};

// memulihkan department yang terhapus (restore)
exports.restoreDepartment = async (id) => {
  if (!id) throw new Error('Department ID is required'); // validasi id

  try {
    // memulihkan department
    const restored = await Department.restore({ where: { id }});
    if (!restored) throw new Error('Department not found'); // menangani kasus jika ID tidak ditemukan
    return restored;
  } catch (error) {
    throw new Error('Error restoring department:' + error.message); // menangani kesalahan
  }
};