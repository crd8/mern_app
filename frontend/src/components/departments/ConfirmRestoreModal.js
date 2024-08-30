import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmRestoreModal = ({ show, handleClose, handleRestore, departmentId, departmentName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestoreClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleRestore(departmentId);
      handleClose();
    } catch (error) {
      console.error('Error restoring department:', error);
      setError('Failed to restore department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop='static'
      keyboard={false}
      aria-labelledby='confirm-restore-modal-title'
      role='dialog'
      aria-live='assertive'
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Restore</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to restore this department "{departmentName}"?</p>
        {loading && <Spinner animation="border" />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button 
          variant="success" 
          onClick={handleRestoreClick} 
          disabled={loading}
        >
          {loading ? 'Restoring...' : 'Restore'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Validasi tipe properti yang diterima komponen
ConfirmRestoreModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleRestore: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
  departmentName: PropTypes.string.isRequired,
};

export default ConfirmRestoreModal;