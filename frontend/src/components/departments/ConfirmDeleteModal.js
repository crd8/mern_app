import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const ConfirmDeleteModal = ({ show, handleClose, handleDelete, departmentId, departmentName, isBulkDelete = false, selectedIds = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteClick = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isBulkDelete) {
        await Promise.all(selectedIds.map(id => handleDelete(id)));
      } else {
        await handleDelete(departmentId);
      }
      handleClose()
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Failed to delete department(s). Please try again.');
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
      aria-labelledby="confirm-delete-modal-title"
      role="dialog"
      aria-live="assertive"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
        {isBulkDelete ? (
          <p>Are you sure you want to archive <strong>all selected departements</strong>? <br/> The data can still be restored in the future if needed.</p>
        ) : (
          <p>Are you sure you want to archive this department "<strong className="text-decoration-underline">{departmentName}</strong>"? <br/> <small className="text-muted">The data can still be restored in the future if needed.</small></p>
        )}
        {loading && <Spinner animation="border" />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="warning"
          onClick={handleDeleteClick}
          disabled={loading}
        >
          {loading ? 'Archiving...' : 'Yes, archive'}
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
  departmentId: PropTypes.string,
  departmentName: PropTypes.string,
  isBulkDelete: PropTypes.bool,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
};

export default ConfirmDeleteModal;