import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert, Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const PermissionModal = ({ permission, show, handleClose, handleSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [existingNames, setExistingNames] = useState([]);

  const refreshExistingNames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/permissions');
      const names = response.data.data.map(permission => permission.name);
      setExistingNames(names); // Memperbarui state existingNames
    } catch (error) {
      console.error('Error fetching existing names: ', error);
    }
  };

  useEffect(() => {
    refreshExistingNames(); // Memanggil fungsi ini saat modal dibuka
  }, [show]); // Hanya ketika modal ditampilkan

  useEffect(() => {
    if (permission) {
      setName(permission.name || '');
      setDescription(permission.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [permission, show]);

  useEffect(() => {
    const isUnchanged = permission && name === permission.name && description === permission.description;
    const isFormIncomplete = !name.trim() || !description.trim();

    setIsSaveDisabled(isUnchanged || isFormIncomplete || !!errors.name);
  }, [name, description, permission, errors]);

  const onModalClose = () => {
    setName('');
    setDescription('');
    setErrors({});
    setSaveError('');
    handleClose();
  }

  const validate = () => {
    let tempErrors = {};
    
    if (!name) tempErrors.name = 'Name is required';
    if (existingNames.includes(name)) tempErrors.name = 'Name already exists';
    if (!description) tempErrors.description = 'Description is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const onNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    // Validasi nama saat user mengetik
    if (existingNames.includes(newName)) {
      setErrors(prevErrors => ({ ...prevErrors, name: 'Name already exists' }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, name: undefined }));
    }
  };

  const onSave = async () => {
    setSaveError(''); 
    if (validate()) {
      try {
        await handleSave({ id: permission?.id, name, description });

        // Hapus nama lama jika ada
        if (permission) {
          setExistingNames((prevNames) => 
            prevNames.filter(existingName => existingName !== permission.name)
          );
        }
        
        setExistingNames((prevNames) => [...prevNames, name]);
        setName('');
        setDescription('');
        handleClose();
      } catch (error) {
        console.error('Failed to save permission: ', error);
        setSaveError('Failed to save permission, Please try again.');
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={onModalClose}
      backdrop='static'
      keyboard={false}
      aria-labelledby='permission-modal-title'
    >
      <Modal.Header closeButton>
        <Modal.Title>{permission ? 'Edit Permission' : 'Add Permission'}</Modal.Title>
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
          {permission ? 'Update' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

PermissionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  permission: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  existingNames: PropTypes.arrayOf(PropTypes.string),
};

export default PermissionModal;
