import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Modal, Spinner, Button } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleDelete, permissionId, permissionName }) => {
 const [loading, setLoading] = useState(false);
 const [error, setError] =  useState(null);

 const handleDeleteClick = async () => {
  setLoading(true);
  setError(null);

  try {
    await handleDelete(permissionId);
    handleClose();
  } catch (error) {
    console.error('Error deleting permission: ', error);
    setError('Failed to delete permission, please try again.');
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
    arial-labelledby='confirm-delete-modal-title'
    role='dialog'
    aria-live='assertive'
  >
    <Modal.Header closeButton>
      <Modal.Title>Confirm Archive Permission</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <p>Are you sure you want to archive this permission "<strong className="text-decoration-underline">{permissionName}</strong>"</p>
      {loading && <Spinner animation="border"/>}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" onClick={handleClose}>
        Cancel
      </Button>
      <Button variant="warning" onClick={handleDeleteClick} disabled={loading}>
        {loading ? 'Archiving...' : 'Yes, archive'}
      </Button>
    </Modal.Footer>
  </Modal>
 );
};

ConfirmDeleteModal.propTypes =  {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  permissionId: PropTypes.string,
  permissionName: PropTypes.string,
};

export default ConfirmDeleteModal;