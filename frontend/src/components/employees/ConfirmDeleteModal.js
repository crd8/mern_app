import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleDelete, employeeId, employeeName}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await handleDelete(employeeId);
      handleClose();
    } catch (error) {
      console.error('Error deleting employee: ', error);
      setError('Failed to delete employee, please try again.');
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
      arial-labelledby='confirm-delete-modal-employee'
      role='dialog'
      aria-live='assertive'
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Archive Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to archive this employee "<strong className="text-decoration-underline">{employeeName}</strong>"? <br/> <small className="text-muted">The data can still be restored in the future if needed.</small></p>
        {loading && <Spinner animation="border"/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={handleClose}>Cancel</Button>
        <Button variant="warning" onClick={handleDeleteClick} disabled={loading}>
          {loading ? 'Archiving...' : 'Yes, archive'}  
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  employeeId: PropTypes.string,
  employeeName: PropTypes.string,
};

export default ConfirmDeleteModal;