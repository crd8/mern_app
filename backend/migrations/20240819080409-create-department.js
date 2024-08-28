'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // up digunakan untuk melakukan migrasi
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Departments', { // perintah untuk membuat tabel baru di db dengan nama Departments
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        // menambahkan properti validate, untuk validasi
        validate: {
          notEmpty: true, // tidak boleh kosong
          len: [2, 100] // panjang minimal 2 karakter dan maksimal 100 karakter
        }
      },

      description: {
        type: Sequelize.STRING,
        allowNull: false
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // mengatur dfault waktu sekarang saat record dibuat
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // mengatur dfault waktu sekarang saat record diperbarui
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
    });
  },
  // down digunakan untuk membatalkan migrasi
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Departments');
  }
};