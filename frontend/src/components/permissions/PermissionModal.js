import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert, Modal, Form, Button } from 'react-bootstrap';

const PermissionModal = ({ permission, show, handleClose, handleSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

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

    setIsSaveDisabled(isUnchanged || isFormIncomplete);
  }, [name, description, permission]);

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
    if (!description) tempErrors.description = 'Description is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const onSave = async () => {
    setSaveError('');
    if (validate()) {
      try {
        await handleSave({ id: permission?.id, name, description });
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
              onChange={(e) => setName(e.target.value)}
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
};

export default PermissionModal;
