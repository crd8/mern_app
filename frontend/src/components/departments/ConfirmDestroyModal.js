import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmDestroyModal = ({ show, handleClose, handleDestroy, departmentId, departmentName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDestroyClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleDestroy(departmentId);
      handleClose();
    } catch (error) {
      console.error('Error destroying department:', error);
      setError('Failed to destroy department. Please try again.');
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
      aria-labelledby="confirm-destroy-modal-title"
      role="dialog"
      aria-live="assertive"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to permanently destroy this department "<strong className="text-decoration-underline">{departmentName}</strong>"? <br/> <small className="text-muted">This action cannot be undone, and the data will not be recoverable.</small></p>
        {loading && <Spinner animation="border" />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="danger"
          onClick={handleDestroyClick}
          disabled={loading}
        >
          {loading ? 'Destroying...' : 'Yes, destroy'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Validasi tipe properti yang diterima komponen
ConfirmDestroyModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDestroy: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
  departmentName: PropTypes.string.isRequired,
};

export default ConfirmDestroyModal;