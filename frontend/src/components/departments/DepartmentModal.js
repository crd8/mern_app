import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const DepartmentModal = ({ show, handleClose, handleSave, department }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [existingNames, setExistingNames] = useState([]);

  const refreshExistingNames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/departments?paranoid=false');
      const names = response.data.data.map(department => department.name);
      setExistingNames(names);
    } catch (error) {
      console.error('Error fetching existing names: ', error)
    }
  };

  useEffect(() => {
    refreshExistingNames();
  }, [show]);

  useEffect(() => {
    if (department) {
      setName(department.name || '');
      setDescription(department.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [department, show]);

  useEffect(() => {
    const isUnchanged = department && name === department.name && description === department.description;
    const isFormIncomplete = !name.trim() || !description.trim();

    setIsSaveDisabled(isUnchanged || isFormIncomplete || !!errors.name);
  }, [name, description, department, errors]);

  const validate = (isUpdate = false) => {
    let tempErrors = {};

    if (!name.trim()) tempErrors.name = 'Name is required';
    if (!isUpdate && existingNames.map(n => n.toLowerCase()).includes(name.trim().toLowerCase())) {
      tempErrors.name = 'Name already exists';
    }

    if (!description.trim()) tempErrors.description = 'Description is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onNameChange = (e) => {
    const newName = e.target.value;
    
    if (newName.toLowerCase() === department?.name.toLowerCase()) {
      setName(newName);
      setErrors(prevErrors => ({ ...prevErrors, name: undefined })); // Pastikan tidak ada error
      return;
    }

    setName(newName);

    if (existingNames.map(n => n.toLowerCase()).includes(newName.toLowerCase())) {
      setErrors(prevErrors => ({ ...prevErrors, name: 'Name already exists'}));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, name: undefined }));
    }
  };

  const onSave = async () => {
    setSaveError('');
    if (validate(department !== null)) {
      try {
        await handleSave({ id: department?.id, name: name.trim(), description: description.trim() });
        
        if (department) {
          setExistingNames((prevNames) =>
            prevNames.filter(existingNames => existingNames !== department.name)
          );
        }
        setExistingNames((prevNames) => [...prevNames, name.trim()]);
        setName('');
        setDescription('');
        handleClose();
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveError('Failed to save department. Please try again.');
      }
    }
  };

  const onModalClose = () => {
    setName('');
    setDescription('');
    setErrors({});
    setSaveError('');
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={onModalClose}
      backdrop='static'
      keyboard={false}
      aria-labelledby="department-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title>{department ? 'Edit Department' : 'Add Department'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {saveError && <Alert variant='danger'>{saveError}</Alert>}
        <Form>
          <Form.Group controlId='formName'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              value={name}
              onChange={onNameChange}
              isInvalid={!!errors.name}
              autoFocus
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId='formDescription' className='mt-3'>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as='textarea'
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isInvalid={!!errors.description}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='light' onClick={onModalClose}>
          Close
        </Button>
        <Button variant='primary' onClick={onSave} disabled={isSaveDisabled}>
          {department ? 'Update' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DepartmentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  department: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  existingNames: PropTypes.arrayOf(PropTypes.string),
};

export default DepartmentModal;