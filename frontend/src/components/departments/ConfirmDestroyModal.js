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
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Destroy</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to permanently destroy this department "{departmentName}"?</p>
        {loading && <Spinner animation="border" />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="danger"
          onClick={handleDestroyClick}
          disabled={loading}
        >
          {loading ? 'Destroying...' : 'Destroy'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmDestroyModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDestroy: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
  departmentName: PropTypes.string.isRequired,
};

export default ConfirmDestroyModal;
