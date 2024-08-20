import React, { useState, useEffect, useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Container, Toast, Pagination, Form, Spinner, Card } from 'react-bootstrap';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import DepartmentModal from "../components/DepartmentModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

function DepartmentPage() {
  // state hooks
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/departments?page=${currentPage}&search=${searchTerm}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDepartments(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ type: 'error', message: `Failed to fetch departments: ${error.message}` });
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSave = async (department) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/departments/${department.id || ''}`,
        {
          method: department.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(department),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      fetchDepartments();
      setShowModal(false);
      setSelectedDepartment(null);
      setNotification({ type: 'success', message: 'Department saved successfully!' });
    } catch (error) {
      console.error('Error saving department:', error.message);
      setNotification({ type: 'error', message: `Failed to save department: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Http error! status: ${response.status}`);
      }

      fetchDepartments();
      setShowConfirmDeleteModal(false);
      setNotification({ type: 'success', message: 'Department deleted successfully!' });
    } catch (error) {
      console.error('Error deleting department:', error.message);
      setNotification({ type: 'error', message: `Failed to delete department: ${error.message} `});
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
    console.log('Deleting ID:', id);
    setDeleteId(id);
    setSelectedDepartment({ id, name, description: '' });
    setShowConfirmDeleteModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm:ss", { locale: enUS });
  };

  return (
    <Container>
      <Card className="mt-3">
        <Card.Header>Department Management</Card.Header>
        <Card.Body>
          <Button className="mb-3" onClick={handleAdd}>Add Department</Button>

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

          {loading && <Spinner animation="border" style={{ display: 'block', margin: 'auto', marginTop: '20px' }} />}

          <Form.Control
            type='text'
            placeholder='Search departments...'
            value={searchTerm}
            onChange={handleSearchChange}
            className='mb-3'
            autoFocus
          />

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created at</th>
                <th>Updated at</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center">No departments found</td>
                </tr>
              )}
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.description}</td>
                  <td>{formatDate(department.createdAt)}</td>
                  <td>{formatDate(department.updatedAt)}</td>
                  <td>
                    <Button variant="info" onClick={() => handleEdit(department)} aria-label={`Edit department ${department.name}`}>Edit</Button>{' '}
                    <Button variant="danger" onClick={() => showDeleteConfirmModal(department.id, department.name)} aria-label={`Delete department ${department.name}`}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>

          <DepartmentModal
            key={selectedDepartment ? selectedDepartment.id : 'new'}
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleSave={handleSave}
            department={selectedDepartment}
          />

          <ConfirmDeleteModal
            show={showConfirmDeleteModal || false}
            handleClose={() => setShowConfirmDeleteModal(false)}
            handleDelete={handleDelete}
            departmentId={deleteId}
            departmentName={selectedDepartment?.name || 'Unknown'}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DepartmentPage;