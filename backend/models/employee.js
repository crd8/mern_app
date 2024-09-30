'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Employee.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nik: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    domicile_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    religion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false
    },
    education: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number_telephone_1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number_telephone_2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    bank_account: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    npwp: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    bpjs_tk: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    bpjs_ks: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nip: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    employee_status: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Employee',
    timestamps: true,
    paranoid: true
  });
  return Employee;
};