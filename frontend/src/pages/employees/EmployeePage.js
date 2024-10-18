import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ButtonGroup, Container, Form, OverlayTrigger, Pagination, Spinner, Table, Toast, ToggleButton, ToggleButtonGroup, Tooltip } from 'react-bootstrap'
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { BsArchive, BsArrowRepeat, BsDatabaseCheck, BsDatabaseX } from 'react-icons/bs';
import ConfirmDeleteModal from '../../components/employees/ConfirmDeleteModal';
import ConfirmRestoreModal from '../../components/employees/ConfirmRestoreModal';
import EmployeeModal from '../../components/employees/EmployeeModal';

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [deleteId, setDeleteId] = useState('');
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [restoreId, setRestoreId] = useState('');
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/deleted-employees' : '';
      const response = await axios.get(`http://localhost:5000/api/employees${endpoint}`, {
        params: {
          page: currentPage,
          search: searchTerm,
        }
      });
      setEmployees(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching employees: ', error);
      setNotification({ type: 'error', message: `Failed to fetch employees: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showDeleted]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, currentPage, showDeleted]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm, employees, currentPage, showDeleted]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: enUS });
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  const showAddModal = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const showDeleteConfirmModal = (id, fullname) => {
    if (!id) {
      console.error('Invalid employee ID for deletion');
      return;
    }
    setDeleteId(id);
    setSelectedEmployee({ id, fullname });
    setShowConfirmDeleteModal(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5000/api/employees/${id}`);
      if (response.status !== 200) throw new Error(`Http error! status: ${response.status}`);

      fetchEmployees();
      setShowConfirmDeleteModal(false);
      setNotification({ type: 'success', message: 'Employee successfully deleted' });
    } catch (error) {
      console.error('Error deleting employee: ', error.message);
      setNotification({ type: 'error', message: `Failed to delete employee: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const showRestoreConfirmModal = (id, fullname) => {
    if (!id) {
      console.error('Invalid employee ID for restoring');
      return;
    }
    setRestoreId(id);
    setSelectedEmployee({ id, fullname });
    setShowConfirmRestoreModal(true);
  };

  const handleRestore = async (id) => {
    setLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/employees/${id}/restore`);
      if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
      fetchEmployees();
      setShowConfirmRestoreModal(false);
      setNotification({ type: 'success', message: 'Employee successfully restored' });
    } catch (error) {

    }
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
                <Button variant='primary' onClick={showAddModal}>
                  Add
                </Button>
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
                  <BsDatabaseCheck size={22}/>
                </ToggleButton>
                <ToggleButton
                  id='radio-inactive'
                  type='radio'
                  variant='outline-secondary'
                  value='inactive'
                  checked={showDeleted}
                >
                  <BsDatabaseX size={22}/>
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
          <div className='d-md-flex justify-content-between align-items-end'>
            <div className='col-md-7'>
              <h4 className='fw-semibold'>{(showDeleted ? 'List of archive employees' : 'List of active employees')}</h4>
              <p className='text-muted'>List of currently active employees, displaying all employees that are still active in the system. You can also view employees that have been archived or deactivated by switching to archive mode.</p>
            </div>
            <div className='col-md-4'>
              <Form.Control
                type='text'
                placeholder='Search employees...'
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
                <th>NIP</th>
                <th>Fullname</th>
                <th>Date of Birth</th>
                <th>Hire Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={employee.id}>
                  <th>{(currentPage - 1) * 10 + (index + 1)}</th>
                  <td className='text-secondary-emphasis'>{employee.nip}</td>
                  <td className='text-secondary-emphasis'>{employee.fullname}</td>
                  <td className='text-secondary-emphasis'>{formatDate(employee.date_of_birth)}</td>
                  <td className='text-secondary-emphasis'>{formatDate(employee.hire_date)}</td>
                  <td className='text-secondary-emphasis'>{employee.employee_status}</td>
                  <td>
                    <ButtonGroup>
                      {!showDeleted && (
                        <OverlayTrigger placement='top' overlay={<Tooltip>Archive</Tooltip>}>
                          <Button variant='link' onClick={() => showDeleteConfirmModal(employee.id, employee.fullname)}><BsArchive/></Button>
                        </OverlayTrigger>
                      )}
                      {showDeleted && (
                        <OverlayTrigger placement='top' overlay={<Tooltip>Restore</Tooltip>}>
                          <Button variant='link' onClick={() => showRestoreConfirmModal(employee.id, employee.fullname)}>
                            <BsArrowRepeat/>
                          </Button>
                        </OverlayTrigger>
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
                onClick={() => handlePageChange}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}

      <EmployeeModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        employee={selectedEmployee}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleDelete={handleDelete}
        employeeId={deleteId}
        employeeName={selectedEmployee?.fullname || ''}
      />

      <ConfirmRestoreModal
        show={showConfirmRestoreModal}
        handleClose={() => setShowConfirmRestoreModal(false)}
        handleRestore={handleRestore}
        employeeId={restoreId}
        employeeName={selectedEmployee?.fullname || ''}
      />
    </Container>
  )
}

export default EmployeePage;