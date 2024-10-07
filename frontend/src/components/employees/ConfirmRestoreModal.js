import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";

const ConfirmRestoreModal = ({ show, handleClose, handleRestore, employeeId, employeeName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestoreClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await handleRestore(employeeId);
      handleClose();
    } catch (error) {
      console.error('Error restoring employee: ', error);
      setError('Failed to restore employee, Please try again');
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
      aria-labelledby='confirm-restore-modal-employee'
      role='dialog'
      aria-live='assertive'
    >
      <Modal.Header closeButton>
        Confirm Restore
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to restore this employee "<strong className="text-decoration-underline">{employeeName}</strong>"</p>
        {loading && <Spinner animation="border"/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={handleClose}>Cancel</Button>
        <Button variant="success" onClick={handleRestoreClick} disabled={loading}>
          {loading ? 'Restoring...' : 'Yes, restore' }
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmRestoreModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleRestore: PropTypes.func.isRequired,
  employeeId: PropTypes.string.isRequired,
  employeeName: PropTypes.string.isRequired,
};

export default ConfirmRestoreModal;