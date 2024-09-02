import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const DepartmentModal = ({ show, handleClose, handleSave, department }) => { // objek props yang diterima oleh komponen
  // State untuk menyimpan nilai form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // untuk mengatur nilai form ketika 'department' berubah
  useEffect(() => {
    if (department) {
      setName(department.name || '');
      setDescription(department.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [department, show]);

  // untuk mengatur status tombol save
  useEffect(() => {
    // Cek apakah data tidak berubah atau form tidak lengkap
    const isUnchanged = department && name === department.name && description === department.description;
    const isFormIncomplete = !name.trim() || !description.trim();

    // Menonaktifkan tombol save jika data tidak berubah atau form tidak lengkap
    setIsSaveDisabled(isUnchanged || isFormIncomplete);
  }, [name, description, department]);

  // Fungsi untuk validasi form
  const validate = () => {
    let tempErrors = {};
    if (!name) tempErrors.name = 'Name is required'; // Pesan kesalahan jika nama kosong
    if (!description) tempErrors.description = 'Description is required'; // Pesan kesalahan jika desc kosong
    setErrors(tempErrors); // Menyimpan pesan kesalahan
    return Object.keys(tempErrors).length === 0; // Mengembalikan true jika tidak ada kesalahan
  };

  // Fungsi untuk menyimpan data departemen
  const onSave = async () => {
    setSaveError(''); // Reset pesan kesalahan simpan
    if (validate()) { // Validasi form
      try {
        // Menyimpan data departemen
        await handleSave({ id: department?.id, name, description });
        // Reset form setelah berhasil menyimpan
        setName('');
        setDescription('');
        handleClose(); // Menutup modal
      } catch (error) {
        console.error('Failed to save:', error); // Menampilkan kesalahan di console
        setSaveError('Failed to save department. Please try again.'); // Pesan kesalahan simpan
      }
    }
  };

  // Fungsi untuk menutup modal
  const onModalClose = () => {
    setName('');
    setDescription('');
    setErrors({});
    setSaveError('');
    handleClose(); // Menutup modal
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
          {department ? 'Update' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Menentukan tipe properti yang diterima komponen ini
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