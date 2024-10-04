import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Spinner, Toast, ToggleButton, ToggleButtonGroup, Form, Table, ButtonGroup, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import { BsArchive, BsArrowRepeat, BsDatabaseCheck, BsDatabaseX, BsPencilSquare, BsTrash } from 'react-icons/bs'
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import PermissionModal from '../../components/permissions/PermissionModal';
import ConfirmDeleteModal from '../../components/permissions/ConfirmDeleteModal';
import ConfirmRestoreModal from '../../components/permissions/ConfirmRestoreModal';
import ConfirmDestroyModal from '../../components/permissions/ConfirmDestroyModal';

function PermissionPage() {
  // useState for fetch permission
  const [permissions, setPermissions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [showDeleted, setShowDeleted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [deleteId, setDeleteId] = useState('');
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [restoreId, setRestoreId] = useState('');
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);

  const [destroyId, setDestroyId] = useState('');
  const [showConfirmDestroyModal, setShowConfirmDestroyModal] = useState(false);

  // fetch permission
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/deleted-permissions' : '';
      const response = await axios.get(`http://localhost:5000/api/permissions${endpoint}`, {
        params: {
          page: currentPage,
          search: searchTerm,
        }
      });
      setPermissions(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching permissions: ', error);
      setNotification({ type: 'error', message: `Failed to fetch permissions: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showDeleted]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions, currentPage, showDeleted]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm, permissions, currentPage, showDeleted]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm:ss", { locale: enUS });
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const showAddModal = () => {
    setSelectedPermission(null);
    setShowModal(true);
  }

  const showEditModal = (permission) => {
    setSelectedPermission(permission);
    setShowModal(true);
  };

  const showDeleteConfirmModal = (id, name) => {
    if (!id) {
      console.error('Invalid permission ID for deletion');
      return;
    }
    setDeleteId(id);
    setSelectedPermission({ id, name, description: '' });
    setShowConfirmDeleteModal(true);
  };

  const showRestoreConfirmModal = (id, name) => {
    if (!id) {
      console.error('Invalid permission ID for restoring');
      return;
    }
    setRestoreId(id);
    setSelectedPermission({ id, name, description: '' });
    setShowConfirmRestoreModal(true);
  };

  const showDestroyConfirmModal = (id, name) => {
    if (!id) {
      console.error('Invalid permission ID for destroying');
      return;
    }
    setDestroyId(id);
    setSelectedPermission({ id, name, description: '' })
    setShowConfirmDestroyModal(true);
  }

  const handleSave = async (permission) => {
    setLoading(true);
    try {
      const response = await axios({
        method: permission.id ? 'PUT' : 'POST',
        url: `http://localhost:5000/api/permissions/${permission.id || ''}`,
        data: permission,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchPermissions();
      setShowModal(false);
      setSelectedPermission(null);
      setNotification({ type: 'success', message: 'Permission successfully saved' });
    } catch (error) {
      console.error(' Error saving permission: ', error.message);
      if (error.response) {
        if (error.response.status === 400) {
          setNotification({ type: 'error', message: error.response.data.error || 'Failed to save permission' });
        } else {
          setNotification({ type: 'error', message: 'Failed to save permission: An unexpected error occurred'})
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to save permission: An unexpected error occurred'})
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5000/api/permissions/${id}`);
      if (response.status !== 200) {
        throw new Error(`Http error! status: ${response.status}`);
      }

      fetchPermissions();
      setShowConfirmDeleteModal(false);
      setNotification({ type: 'success', message: 'Permission successfully deleted' });
    } catch (error) {
      console.error('Error deleting permission: ', error.message);
      setNotification({ type: 'error', message: `Failed to delete permission: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/permissions/${id}/restore`);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchPermissions();
      setShowConfirmRestoreModal(false);
      setNotification({ type: 'success', message: 'Permission successfully restored' });
    } catch (error) {
      console.error('Error restoring permission: ', error.message);
      setNotification({ type: 'error', message: `Failed to restore permission: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDestroy = async (id) => {
    setLoading(true);

    try {
      const response = await axios.delete(`http://localhost:5000/api/permissions/${id}/destroy`);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchPermissions();
      setShowConfirmDestroyModal(false);
      setNotification({ type: 'success', message: 'Permission successfully deleted' });
    } catch (error) {
      console.error('Error destroying permission', error.message);
      setNotification({ type: 'error', message: `Failed to destroy permission: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='pt-4'>
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
            <strong className='me-auto'>
              {notification.type === 'success' ? 'Success Notification' : 'Error Notification'}
            </strong>
          </Toast.Header>
          <Toast.Body>
            {notification.message}
          </Toast.Body>
        </Toast>
      )}
      {loading && <Spinner animation='border' />}
      {!loading && (
        <>
          <div className='d-flex justify-content-between'>
            <div>
              {!showDeleted && (
                <Button variant='primary' onClick={showAddModal} >Add</Button>
              )}
            </div>
            <div>
              <ToggleButtonGroup
                type='radio'
                name='status-options'
                value={showDeleted ? 'inactive' : 'active'}
                onChange={(val) => setShowDeleted(val === 'inactive')}
                className='mb-2'
              >
                <ToggleButton
                  id='radio-active'
                  type='radio'
                  variant='outline-primary'
                  value='active'
                  checked={!showDeleted}
                >
                  <BsDatabaseCheck size={22} />
                </ToggleButton>

                <ToggleButton
                  id='radio-inactive'
                  type='radio'
                  variant='outline-secondary'
                  value='inactive'
                  checked={showDeleted}
                >
                  <BsDatabaseX size={22} />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
          <div className='d-md-flex justify-content-between align-items-end'>
            <div className="col-md-7">
              <h4 className='fw-semibold'>{(showDeleted ? 'List of archive permissions' : 'List of active permissions')}</h4>
              <p className='text-muted'>List of currently active permissions, displaying all permissions that are still active in the system. You can also view permissions that have been archived or deactivated by switching to archive mode.</p>
            </div>
            <div className="col-md-4">
              <Form.Control
                type='text'
                placeholder='Search permission...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='mb-3'
                ref={searchInputRef}
              />
            </div>
          </div>
          <Table responsive>
            <thead>
              <tr>
                <th>#</th>
                <th style={{minWidth: 200}}>Name</th>
                <th style={{minWidth: 400}}>Description</th>
                <th className='text-nowrap' style={{minWidth: 145}}>Created At</th>
                <th className='text-nowrap' style={{minWidth: 145}}>{(showDeleted ? 'Deleted At' : 'Updated At')}</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={permission.id}>
                  <th>{(currentPage - 1) * 10 + (index + 1)}</th>
                  <td className='text-secondary-emphasis'>{permission.name}</td>
                  <td className='text-secondary-emphasis'>{permission.description}</td>
                  <td className='text-secondary-emphasis'>{formatDate(permission.createdAt)}</td>
                  <td className='text-secondary-emphasis'>{formatDate(showDeleted ? permission.deletedAt : permission.updatedAt)}</td>
                  <td>
                    <ButtonGroup>
                      {!showDeleted && (
                        <>
                          <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              variant='link'
                              onClick={() => showEditModal(permission)}
                            >
                              <BsPencilSquare />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Archive</Tooltip>}
                          >
                            <Button
                              variant='link'
                              onClick={() => showDeleteConfirmModal(permission.id, permission.name)}
                            >
                              <BsArchive />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}

                      {showDeleted && (
                        <>
                          <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Restore</Tooltip>}
                          >
                            <Button
                              variant='link'
                              onClick={() => showRestoreConfirmModal(permission.id, permission.name)}
                            >
                              <BsArrowRepeat />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Destroy</Tooltip>}
                          >
                            <Button
                              variant='link'
                              onClick={() => showDestroyConfirmModal(permission.id, permission.name)}
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

          <Pagination className='mt-3'>
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
      
      <PermissionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSave}
        permission={selectedPermission}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleDelete={handleDelete}
        permissionId={deleteId}
        permissionName={selectedPermission?.name || ''}
      />

      <ConfirmRestoreModal
        show={showConfirmRestoreModal}
        handleClose={() => setShowConfirmRestoreModal(false)}
        handleRestore={handleRestore}
        permissionId={restoreId}
        permissionName={selectedPermission?.name || ''}
      />

      <ConfirmDestroyModal
        show={showConfirmDestroyModal}
        handleClose={() => setShowConfirmDestroyModal(false)}
        handleDestroy={handleDestroy}
        permissionId={destroyId}
        permissionName={selectedPermission?.name || ''}
      />
    </Container>
  )
}

export default PermissionPage;