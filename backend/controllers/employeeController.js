const employeeService = require('../services/employeeService');

exports.getAllEmployees = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', paranoid = true } = req.query;
    const employees = await employeeService.getEmployees({ page, pageSize, search, paranoid: paranoid === 'false' ? 'false' : 'true' });
    res.json(employees);
  } catch (error) {
    console.error('Error in get employees: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDeletedEmployees = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = ''} = req.query;
    const deletedEmployees = await employeeService.getDeletedEmployees({ page, pageSize, search });
    res.json(deletedEmployees);
  } catch (error) {
    console.error('Error in get deleted employees: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Employee ID is required' });

    const employee = await employeeService.getEmployeeById(id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error in get employee by id: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status } = req.body;

    const requiredFields = {
      nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) return res.status(400).json({ error: `${key.replace('_', ' ')} is required` });
    }

    const employee = await employeeService.createEmployee({
      nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status
    });

    res.status(201).json({ message: 'Employee data successfully created', employee });
  } catch (error) {
    const duplicateErrorMessages = [
      'NIK already exists', 'Email already exists', 'Account Number already exists', 'NPWP already exists', 'BPJS Ketenagakerjaan number already exists', 'BPJS Kesehatan number already exists', 'NIP already exists'
    ]
    if (duplicateErrorMessages.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error in created data employee: ', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status } = req.body;
    const { id } = req.params;

    const requiredFields = {
      nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`${key.replace('_', ' ')} is required`);
    }

    const employee = await employeeService.updateEmployee(id, { nik, fullname, date_of_birth, gender, address, domicile_address, religion, nationality, education, number_telephone_1, number_telephone_2, email, bank_account, account_number, npwp, bpjs_tk, bpjs_ks, hire_date, nip, employee_status });
    if (employee) {
      res.json({ message: 'Employee successfully updated', employee });
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error in update employee: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Employee ID is required' });

    const result = await employeeService.deleteEmployee(id);
    if (result.message === 'Employee not found') {
      res.status(404).json({ error: result.message });
    } else {
      res.status(200).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in delete employee: ', error);
    res.status(500).json({ error: error.message });
  }
};

exports.destroyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Employee ID is required' });

    const result = await employeeService.destroyEmployee(id);
    if (!result) {
      res.status(200).json({ message: 'Employee successfully permanently deleted' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    if (error.message === 'Employee not found' || error.message === 'Employee must be soft deleted first') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error in destroyed employee: ', error.message);
    res.status(500).json({ error: 'An unexpected error occured' });
  }
};

exports.restoreEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Employee ID is required' });

    const result = await employeeService.restoreEmployee(id);
    if (result) {
      res.status(200).json({ message: 'Employee successfully restored' });
    } else {
      res.status(404).json({ message: 'Employee not found'});
    }
  } catch (error) {
    console.error('Error in restore employee: ', error);
    res.status(500).json({ error: error.message });
  }
};