import React, { useState } from "react"
import PropTypes from "prop-types"
import { Button, Modal, Spinner, Alert } from "react-bootstrap"

const ConfirmDestroyModal = ({ show, handleClose, handleDestroy, permissionId, permissionName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDestroyClick = async () => {
    setLoading(true);
    setError(null)

    try {
      await handleDestroy(permissionId);
      handleClose();
    } catch (error) {
      console.error('Error destroying permission: ', error);
      setError('Failed to destroy permission, Please try again.');
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
      aria-labelledby='confirm-destroy-modal'
      role='dialog'
      aria-live='assertive'
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete Permission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to permanently destroy this permission "<strong className="text-decoration-underline">{permissionName}</strong>"? <br/> <small className="text-muted">This action cannot be undone, and the data will not be recoverable.</small></p>
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
          {loading ? 'Deleting...' : 'Yes, delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmDestroyModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDestroy: PropTypes.func.isRequired,
  permissionId: PropTypes.string.isRequired,
  permissionName: PropTypes.string.isRequired,
};

export default ConfirmDestroyModal;