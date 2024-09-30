const { Employee } = require('../models');
const { Op } = require('sequelize');

exports.getEmployees = async ({ page = 1, pageSize = 10, search = '' }) => {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNum) || pageNum <= 0) throw new Error('Invalid page number');
  if (isNaN(size) || size <= 0) throw new Error('Invalid page size');

  const offset = (pageNum - 1) * size;

  try {
    const { count, rows } = await Employee.findAndCountAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.like]: `%${search}%` } },
          { nip: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: size,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      totalPages: Math.ceil(count / size),
      currentPage: pageNum,
    };
  } catch (error) {
    throw new Error('Error fetching employee: ' + error.message);
  }
};

exports.getEmployeeById = async (id) => {
  if (!id) throw new Error('Employee ID is required');

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  } catch (error) {
    throw new Error('Error fetching employee: ' + error.message);
  }
};

exports.createEmployee = async (employeeData) => {
  const { nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status } = employeeData;

  const requiredFields = {
    nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status
  };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) throw new Error(`${key.replace('_', ' ')} is required`);
  }

  try {
    const existingEmployee = await Employee.findOne({
      where: {
        [Op.or]: [
          { nik },
          { email },
          { account_number },
          { npwp },
          { bpjs_tk },
          { bpjs_ks },
          { nip }
        ]
      }
    });

    if (existingEmployee) {
      if (existingEmployee.nik === nik) throw new Error('NIK already exists');
      if (existingEmployee.email === email) throw new Error('Email already exists');
      if (existingEmployee.account_number === account_number) throw new Error('Account Number already exists');
      if (existingEmployee.npwp === npwp) throw new Error('NPWP already exists');
      if (existingEmployee.bpjs_tk === bpjs_tk) throw new Error('BPJS Ketenagakerjaan number already exists');
      if (existingEmployee.bpjs_ks === bpjs_ks) throw new Error('BPJS Kesehatan number already exists');
      if (existingEmployee.nip === nip) throw new Error('NIP already exists');
    }

    const newEmployee = await Employee.create(employeeData);
    return newEmployee;
  } catch (error) {
    console.error('Error creating data employee: ', error.message);
    throw new Error(error.message);
  }
};

exports.updateEmployee = async (id, employeeData) => {
  const { nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status } = employeeData

  const requiredFields = {
    id, nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status
  };
  for (const[key, value] of Object.entries(requiredFields)) {
    if (!value) throw new Error(`${key.replace('_', ' ')} is required`);
  }

  try {
    const [updated] = await Employee.update(employeeData, { where: { id } });
    if (updated) return await Employee.findByPk(id);
    throw new Error('Employee not found');
  } catch (error) {
    throw new Error('Error updating employee: ' + error.message);
  }
};