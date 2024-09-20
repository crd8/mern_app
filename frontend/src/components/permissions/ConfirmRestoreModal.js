import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmRestoreModal = ({ show, handleClose, handleRestore, permissionId, permissionName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestoreClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await handleRestore(permissionId);
      handleClose();
    } catch (error) {
      console.error('Error restoring permission: ', error);
      setError('Failed to restore permission, Please try again.');
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
        Confirm Restore
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to restore this permission "<strong className="text-decoration-underline">{permissionName}</strong>"</p>
        {loading && <Spinner animation="border"/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={handleClose}>Cancel</Button>
        <Button variant="success" onClick={handleRestoreClick} disabled={loading}>
          {loading ? 'Restoring...' : 'Yes, restore'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmRestoreModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleRestore: PropTypes.func.isRequired,
  permissionId: PropTypes.string.isRequired,
  permissionName: PropTypes.string.isRequired,
};

export default ConfirmRestoreModal;