import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleDelete, departmentId, departmentName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleDelete(departmentId);
      handleClose();
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Failed to delete department. please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
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

ConfirmDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
  departmentName: PropTypes.string.isRequired,
};

export default ConfirmDeleteModal;