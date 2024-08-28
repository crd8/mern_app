'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  // inisialisasi model department dengan atribut dan opsi terkait
  Department.init({
    id: {
      type: DataTypes.UUID, // tipe data UUID untuk primary key
      defaultValue: DataTypes.UUIDV4, // default value adalah UUIDV4
      primaryKey: true // menandakan sebagai primary key
    },

    name: {
      type: DataTypes.STRING, // tipe data string
      allowNull: false, // tidak boleh null, wajib diisi
      unique: true // harus unik, tidak boleh duplikat
    },

    description: {
      type: DataTypes.STRING, // tipe data string
      allowNull: false // tidak boleh null, wajib diisi
    },
  }, {
    sequelize, // instance Sequelize yang digunakan
    modelName: 'Department', // nama model
    timestamps: true, // mengaktifkan kolom createdAt dan updatedAt secara otomatis
    paranoid: true, // mengaktifkan softdelete dengan kolom deletedAt
  });

  return Department; // mengembalikan model department
};