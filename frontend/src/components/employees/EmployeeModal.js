import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Form, Modal, Tab, Tabs } from "react-bootstrap";
import axios from "axios";

const EmployeeModal = ({ employee, show, handleClose, handleSave }) => {
  const [key, setKey] = useState('personal');
  const [nik, setNik] = useState('');
  const [fullname, setFullname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [domicileAddress, setDomicileAddress] = useState('');
  const [religion, setReligion] = useState('');
  const [nationality, setNationality] = useState('');
  const [education, setEducation] = useState('');
  const [numberTelephone1, setNumberTelephone1] = useState('');
  const [numberTelephone2, setNumberTelephone2] = useState('');
  const [email, setEmail] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [npwp, setNpwp] = useState('');
  const [bpjstk, setBpjstk] = useState('');
  const [bpjsks, setBpjsks] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [nip, setNip] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('');

  const [existingNiks, setExistingNiks] = useState([]);
  const [existingAccountNumbers, setExistingAccountNumbers] = useState([]);

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  const refreshExistingData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees?paranoid=false');
      const employees = response.data.data;

      setExistingNiks(employees.map(employee => employee.nik));
      setExistingAccountNumbers(employees.map(employee => employee.account_number));
    } catch (error) {
      console.error('Error fetching existing data: ', error);
    }
  };

  useEffect(() => {
    if (show) {
      refreshExistingData();
    }
  }, [show]);

  const validate = () => {
    let tempErrors = {};

    // validasi NIK
    if (!nik.trim()) {
      tempErrors.nik = 'NIK is required';
    } else if (existingNiks.includes(nik)) {
      tempErrors.nik = 'NIK already exist';
    } else if (!/^\d{16}$/.test(nik)) {
      tempErrors.nik = 'NIK must be 16 digits';
    }

    // validasi accountNumber
    if (!accountNumber.trim()) {
      tempErrors.accountNumber = 'Account number is required';
    } else if (setExistingAccountNumbers.includes(accountNumber)) {
      tempErrors.accountNumber = 'Account number already exist';
    } else if (!/^\d{1,20}$/.test(accountNumber)) {
      tempErrors.accountNumber = 'Account number must be 1 ~ 20 digits numbers';
    }

    // validasi fullname
    if (!fullname.trim()) tempErrors.fullname = 'Fullname is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const onNikChange = (e) => {
    const newNik = e.target.value;
    setNik(newNik);
  
    if (existingNiks.includes(newNik)) {
      setErrors(prevErrors => ({ ...prevErrors, nik: 'NIK already exists' }));
    } else if (!/^\d{16}$/.test(newNik)) {
      setErrors(prevErrors => ({ ...prevErrors, nik: 'must be 16 digits numbers' }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, nik: undefined }));
    }
  };

  const onAccountNumberChange = (e) => {
    const newAccountNumber = e.target.value;
    setAccountNumber(newAccountNumber);

    if (existingAccountNumbers.includes(newAccountNumber)) {
      setErrors(prevErrors => ({ ...prevErrors, accountNumber: 'Account number already exists' }));
    } else if (!/^\d{1,20}$/.test(newAccountNumber)) {
      setErrors(prevErrors => ({ ...prevErrors, accountNumber: 'Account number must be 1 ~ 20 digits numbers'}))
    } else {
      setErrors(prevErrors => ({ ...prevErrors, accountNumber: undefined }));
    }
  };

  const onFullnameChange = (e) => {
    const newFullname = e.target.value;
    setFullname(newFullname);

    if (!newFullname.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, fullname: 'Fullname is required' }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, fullname: undefined }));
    }
  };

  // MODAL
  const onModalClose = () => {
    handleClose();
  }

  return (
    <Modal
      show={show}
      onHide={onModalClose}
      backdrop='static'
      keyboard={false}
      aria-labelledby='employee-modal'
    >
      <Modal.Header closeButton>
        <Modal.Title>{employee ? 'Edit Employee' : 'Add Employee'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        <Form>
          <Tabs
            id="employee-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="personal" title='Personal'>
              <Form.Group controlId="formNik">
                <Form.Label>NIK</Form.Label>
                <Form.Control
                  type="text"
                  value={nik}
                  onChange={onNikChange}
                  isInvalid={!!errors.nik}
                  autoFocus
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nik}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formFullname" className="mt-3">
                <Form.Label>Fullname</Form.Label>
                <Form.Control
                  type="text"
                  value={fullname}
                  onChange={onFullnameChange}
                  isInvalid={!!errors.fullname}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullname}
                </Form.Control.Feedback>
              </Form.Group>
            </Tab>
            <Tab eventKey='employement' title='Employement Details'>
              <Form.Group controlId="formAccountNumber">
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={accountNumber}
                  onChange={onAccountNumberChange}
                  isInvalid={!!errors.accountNumber}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.accountNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Tab>
          </Tabs>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onModalClose}>
          Close  
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EmployeeModal;