import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, ToggleButtonGroup, ToggleButton, ButtonGroup, Container, Toast, Pagination, Form, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsPencilSquare, BsTrash, BsArchive, BsArrowRepeat, BsDatabaseCheck, BsDatabaseX } from "react-icons/bs";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import DepartmentModal from "../../components/departments/DepartmentModal";
import ConfirmDeleteModal from "../../components/departments/ConfirmDeleteModal";
import ConfirmDestroyModal from "../../components/departments/ConfirmDestroyModal";
import ConfirmRestoreModal from "../../components/departments/ConfirmRestoreModal";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showConfirmDeleteSelectedModal, setShowConfirmDeleteSelectedModal] = useState(false);
  const [showConfirmDestroyModal, setShowConfirmDestroyModal] = useState(false);
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [destroyId, setDestroyId] = useState('');
  const [restoreId, setRestoreId] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/deleted-departments' : '';
      const response = await axios.get(`http://localhost:5000/api/departments${endpoint}`, {
        params: {
          page: currentPage,
          search: searchTerm,
        }
      });
      setDepartments(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ type: 'error', message: `Failed to fetch departments: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showDeleted]);
  
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, currentPage, showDeleted]);

  const handleSave = async (department) => {
    setLoading(true);
    try {
      const isUpdate = Boolean(department.id);
      const response = await axios({
        method: department.id ? 'PUT' : 'POST',
        url: `http://localhost:5000/api/departments/${department.id || ''}`,
        data: department,
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      fetchDepartments();
      setShowModal(false);
      setSelectedDepartment(null);

      const message = isUpdate
        ? `Department "${department.name}" successfully updated!`
        : `Department "${department.name}" successfully added!`
      ;
      setNotification({ type: 'success', message });
    } catch (error) {
      console.error('Error saving department:', error.message);
      if (error.response) {
        if (error.response.status === 400) {
          setNotification({ type: 'error', message: error.response.data.error || 'Failed to save department' });
        } else {
          setNotification({ type: 'error', message: 'Failed to save department: An unexpected error occurred' });
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to save department: An unexpected error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`);
      fetchDepartments();
      setShowConfirmDeleteModal(false);
      setNotification({ type: 'success', message: `Department "${name}" successfully archived!` });
    } catch (error) {
      console.error('Error deleting department:', error.message);
      const message = error.response?.data?.error || 'An unexpected error occured';
      setNotification({ type: 'error', message: `Failed to delete department: ${message} `});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      setNotification({ type: 'error', message: 'No departments selected for deletion' });
      return;
    } else {
      setShowConfirmDeleteSelectedModal(true);
    }
  };

  const handleConfirmDeleteSelected = async () => {
    setShowConfirmDeleteSelectedModal(false);
    setLoading(true);
  
    try {
      await axios.post('http://localhost:5000/api/departments/batch-delete', { ids: selectedIds });
      fetchDepartments();
      setNotification({ type: 'success', message: 'Selected departments deleted successfully!' });
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting selected departments:', error.message);
      setNotification({ type: 'error', message: `Failed to delete selected departments: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (id) => {
    setSelectedIds(prevState => 
      prevState.includes(id) ? prevState.filter(selectedId => selectedId !== id) : [...prevState, id]
    );
  };

  const handleDestroy = async (id, name) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}/destroy`);
      fetchDepartments();
      setShowConfirmDestroyModal(false);
      setNotification({ type: 'success', message: `Department "${name}" successfully deleted!` });
    } catch (error) {
      console.error('Error destroying department: ', error.message);
      const message = error.response?.data?.error || 'An unexpected error occured';
      setNotification({ type: 'error', message: `Failed to destroy department: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, name) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/departments/${id}/restore`);
      fetchDepartments();
      setShowConfirmRestoreModal(false);
      setNotification({ type: 'success', message: `Department "${name}" successfully restored!` });
    } catch (error) {
      console.error('Error restoring department: ', error.message);
      const message =  error.response?.data?.error || 'An unexpected error occured';
      setNotification({ type: 'error', message: `Failed to restore department: ${message}` })
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const showDeleteConfirmModal = (id, name) => {
    if (!id) {
      console.error("invalid ID for deletion");
      return;
    }
    setDeleteId(id);
    setSelectedDepartment({ id, name, description: '' });
    setShowConfirmDeleteModal(true);
  };

  const showDestroyConfirmModal = (id, name) => {
    setDestroyId(id);
    setSelectedDepartment({ id, name, description: '' });
    setShowConfirmDestroyModal(true);
  };

  const showRestoreConfirmModal = (id, name) => {
    setRestoreId(id);
    setSelectedDepartment({ id, name, description: '' });
    setShowConfirmRestoreModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm, departments, currentPage, showDeleted]);

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setSelectedIds([]);
  }, [showDeleted]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm:ss", { locale: enUS });
  };

  return (
    <Container className="pt-4">
      {notification && (
        <Toast
          onClose={() => setNotification(null)}
          autohide
          delay={8000}
          show={!!notification}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            minWidth: '200px',
            zIndex: 1050
          }}
        >
          <Toast.Header>
            <strong className="me-auto">
              {notification.type === 'success' ? 'Success Notification' : 'Error Notification'}
            </strong>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      )}
      {loading && <Spinner animation="border" />}
      {!loading && (
        <>
          <div className="d-flex justify-content-between">
            <div>
              {!showDeleted && (
                <Button variant="primary" onClick={handleAdd}>Add</Button>
              )}
              {selectedIds.length > 0 && (
                <Button className="ms-1" variant="warning" onClick={handleDeleteSelected}>Archive</Button>
              )}
            </div>
            <div>
              <ToggleButtonGroup
                type="radio"
                name="status-options"
                value={showDeleted ? 'inactive' : 'active'}
                onChange={(val) => setShowDeleted(val === 'inactive')}
                className="mb-2"
              >
                <ToggleButton
                  id="radio-active"
                  type="radio"
                  variant="outline-primary"
                  value="active"
                  checked={!showDeleted}
                >
                  <BsDatabaseCheck size={22} />
                </ToggleButton>

                <ToggleButton
                  id="radio-inactive"
                  type="radio"
                  variant="outline-secondary"
                  value="inactive"
                  checked={showDeleted}
                >
                  <BsDatabaseX size={22} />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
          <div className="d-md-flex justify-content-between align-items-end">
            <div className="col-md-7">
              <h4 className="fw-semibold">{(showDeleted ? 'List of archive departments' : 'List of active departments')}</h4>
              <p className="text-muted">List of currently active departments, displaying all departments that are still active in the system. You can also view departments that have been archived or deactivated by switching to archive mode.</p>
            </div>
            <div className="col-md-4">
              <Form.Control
                type="text"
                placeholder="Search department..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3"
                ref={searchInputRef}
              />
            </div>
          </div>
          <Table responsive>
            <thead>
              <tr>
                <th>#</th>
                {!showDeleted && (
                  <th>Select</th>
                )}
                <th style={{minWidth: 200}}>Name</th>
                <th style={{minWidth: 400}}>Description</th>
                <th className="text-nowrap" style={{minWidth: 145}}>Created At</th>
                <th className="text-nowrap" style={{minWidth: 145}}>{(showDeleted ? 'Archived At' : 'Updated At')}</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department, index) => (
                <tr
                  key={department.id}
                  className={selectedIds.includes(department.id) ? "table-active" : ""}
                >
                  <th>{(currentPage - 1) * 10 + (index + 1)}</th>
                  {!showDeleted && (
                  <td className="text-end">
                    <input
                    type="checkbox"
                    checked={selectedIds.includes(department.id)}
                    onChange={() => handleSelectChange(department.id)}
                    />
                  </td>
                  )}
                  <td className="text-secondary-emphasis">{department.name}</td>
                  <td className="text-secondary-emphasis">{department.description}</td>
                  <td className="text-secondary-emphasis">{formatDate(department.createdAt)}</td>
                  <td className="text-secondary-emphasis">{formatDate(showDeleted ? department.deletedAt : department.updatedAt)}</td>
                  <td>
                    <ButtonGroup>
                      {!showDeleted && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              variant="link"
                              onClick={() => handleEdit(department)}
                            >
                              <BsPencilSquare />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Archive</Tooltip>}
                          >
                            <Button
                              variant="link"
                              onClick={() => showDeleteConfirmModal(department.id, department.name)}
                            >
                              <BsArchive />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}

                      {showDeleted && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Restore</Tooltip>}
                          >
                            <Button
                              variant="link"
                              onClick={() => showRestoreConfirmModal(department.id, department.name)}
                            >
                              <BsArrowRepeat />
                            </Button> 
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Destroy</Tooltip>}
                          >
                            <Button
                              variant="link"
                              onClick={() => showDestroyConfirmModal(department.id, department.name)}
                            >
                              <BsTrash />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Pagination className="mt-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}

      <DepartmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSave}
        department={selectedDepartment}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleDelete={() => handleDelete(deleteId, selectedDepartment?.name)}
        departmentId={deleteId}
        departmentName={selectedDepartment?.name || ''}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteSelectedModal}
        handleClose={() => setShowConfirmDeleteSelectedModal(false)}
        handleDelete={handleConfirmDeleteSelected}
        isBulkDelete={true}
        selectedIds={selectedIds}
      />

      <ConfirmDestroyModal
        show={showConfirmDestroyModal}
        handleClose={() => setShowConfirmDestroyModal(false)}
        handleDestroy={() => handleDestroy(destroyId, selectedDepartment?.name)}
        departmentId={destroyId}
        departmentName={selectedDepartment?.name || ''}
      />

      <ConfirmRestoreModal
        show={showConfirmRestoreModal}
        handleClose={() => setShowConfirmRestoreModal(false)}
        handleRestore={() => handleRestore(restoreId, selectedDepartment?.name)}
        departmentId={restoreId}
        departmentName={selectedDepartment?.name || ''}
      />
    </Container>
  );
}

export default DepartmentPage;