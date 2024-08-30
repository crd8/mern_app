import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleDelete, departmentId, departmentName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk menangani klik tombol hapus
  const handleDeleteClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleDelete(departmentId); // Menghapus departemen
      handleClose();// Menutup modal setelah berhasil
    } catch (error) {
      console.error('Error deleting department:', error); // Log kesalahan di console
      setError('Failed to delete department. Please try again.'); // Set pesan kesalahan
    } finally {
      setLoading(false); // Set loading ke false setelah operasi selesai
    }
  };

  return (
    <Modal 
      show={show}
      onHide={handleClose}
      backdrop='static'
      keyboard={false}
      aria-labelledby="confirm-delete-modal-title"
      role="dialog"
      aria-live="assertive"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to delete this department "{departmentName}"?</p>
        {loading && <Spinner animation="border" />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="danger"
          onClick={handleDeleteClick}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Validasi tipe properti yang diterima komponen
ConfirmDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
  departmentName: PropTypes.string.isRequired,
};

export default ConfirmDeleteModal;