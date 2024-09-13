import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Spinner, Toast, ToggleButton, ToggleButtonGroup, Form, Table, ButtonGroup, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import { BsArchive, BsDatabaseCheck, BsDatabaseX, BsPencilSquare } from 'react-icons/bs'
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
                <Button variant='primary'>Add</Button>
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
          <div className='d-sm-flex justify-content-between align-items-end'>
            <div>
              <h4 className='fw-semibold'>{(showDeleted ? 'List of archive permissions' : 'List of active permissions')}</h4>
              <p className='text-muted'>Lorem ipsum dolor sit amet, dolor lorem</p>
            </div>
            <div>
              <Form.Control
                type='text'
                placeholder='Search permission...'
                value={handleSearchChange}
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
                  <td className='text-secondary-empahasis'>{permission.name}</td>
                  <td className='text-secondary-empahasis'>{permission.description}</td>
                  <td className='text-secondary-empahasis'>{formatDate(permission.createdAt)}</td>
                  <td className='text-secondary-empahasis'>{formatDate(showDeleted ? permission.deletedAt : permission.updatedAt)}</td>
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
                            >
                              <BsPencilSquare/>
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Archive</Tooltip>}
                          >
                            <Button
                              variant='link'
                            >
                              <BsArchive/>
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
            {Array.from({ length: totalPages }, (_, i) =>
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                
              >
                {i + 1}
              </Pagination.Item>
            )}
          </Pagination>
        </>
      )}
    </Container>
  )
}

export default PermissionPage;