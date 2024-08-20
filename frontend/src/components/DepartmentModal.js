import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const DepartmentModal = ({ show, handleClose, handleSave, department }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

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

    setIsSaveDisabled(isUnchanged || isFormIncomplete);
  }, [name, description, department]);

  const validate = () => {
    let tempErrors = {};
    if (!name) tempErrors.name = 'Name is required';
    if (!description) tempErrors.description = 'Description is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSave = async () => {
    setSaveError('');
    if (validate()) {
      try {
        await handleSave({ id: department?.id, name, description });
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
    <Modal show={show} onHide={onModalClose}>
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
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
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
            />
            <Form.Control.Feedback type='invalid'>
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onModalClose}>
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
};

export default DepartmentModal;
