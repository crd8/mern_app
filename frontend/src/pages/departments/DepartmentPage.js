// Import library dan komponen yang diperlukan
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from 'axios'; // untuk melakukan permintaan HTTP
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, ToggleButtonGroup, ToggleButton, ButtonGroup, Container, Toast, Pagination, Form, Spinner, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsPencilSquare, BsTrash, BsArrowClockwise } from "react-icons/bs";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import DepartmentModal from "../../components/departments/DepartmentModal";
import ConfirmDeleteModal from "../../components/departments/ConfirmDeleteModal";
import ConfirmDestroyModal from "../../components/departments/ConfirmDestroyModal";
import ConfirmRestoreModal from "../../components/departments/ConfirmRestoreModal";

function DepartmentPage() {
  // state
  const [departments, setDepartments] = useState([]); // State untuk data departemen
  const [totalPages, setTotalPages] = useState(1); // State untuk total jumlah halaman
  const [currentPage, setCurrentPage] = useState(1); // State untuk nomor halaman saat ini
  const [searchTerm, setSearchTerm] = useState(''); // State untuk kata kunci pencarian
  const searchInputRef = useRef(null); // Ref untuk mengelola fokus input pencarian
  const [showModal, setShowModal] = useState(false); // State untuk menampilkan atau menyembunyikan modal departemen
  const [selectedDepartment, setSelectedDepartment] = useState(null); // State untuk departemen yang dipilih untuk di-edit
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // State untuk menampilkan atau menyembunyikan modal konfirmasi hapus
  const [showConfirmDestroyModal, setShowConfirmDestroyModal] = useState(false); // State untuk menampilkan atau menyembunyikan modal konfirmasi musnah
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false); // State untuk menampilkan atau menyembunyikan modal konfirmasi restore
  const [deleteId, setDeleteId] = useState(''); // State untuk menyimpan ID departemen yang akan dihapus
  const [destroyId, setDestroyId] = useState(''); // State untuk menyimpan ID departemen yang akan dimusnahkan
  const [restoreId, setRestoreId] = useState(''); // State untuk menyimpan ID departemen yang akan di restore
  const [notification, setNotification] = useState(null); // State untuk pesan notifikasi
  const [loading, setLoading] = useState(false); // State untuk mengelola indikator loading
  const [showDeleted, setShowDeleted] = useState(false); // State untuk toggle antara departemen aktif dan nonaktif

  // untuk mengambil data department dari API
  const fetchDepartments = useCallback(async () => {
    setLoading(true); // set state loading ke true saat data sedang di fetch
    try {
      const endpoint = showDeleted ? '/deleted-departments' : ''; // Memilih endpoint berdasarkan apakah akan menampilkan departemen yang dihapus
      const response = await axios.get(`http://localhost:5000/api/departments${endpoint}`, { // mengirim permintaan get ke server
        params: {
          page: currentPage, // mengirim nomor halaman saat ini sebagai parameter
          search: searchTerm, // mengirim pencarian sebagai parameter
        }
      });
      setDepartments(response.data.data); // memperbarui state department denan data dari server
      setTotalPages(response.data.totalPages); // memperbarui state total halaman dengan data dari server
    } catch (error) {
      console.error('Error fetching departments:', error); // menampilkan error saat gagal mengambil data
      setNotification({ type: 'error', message: `Failed to fetch departments: ${error.message}` }); // menampilkan notifikasi kesalahan
    } finally {
      setLoading(false); // mengatur state loading ke false saat pengambilan data selesai
    }
  }, [currentPage, searchTerm, showDeleted]); // fungsi ini akan dijlankan kembali bila cuurrenge, searchtem dan showdelete berubah
  
  // useEffect untuk menjalankan fungsi fetchDepartments saat komponen dimuat atau ketika dependensi berubah
  useEffect(() => {
    fetchDepartments(); // Mengambil data departemen
  }, [fetchDepartments, currentPage, showDeleted]); // Daftar dependensi yang memicu efek ini

  // Fungsi untuk menangani penyimpanan (pembuatan atau pembaruan) departemen
  const handleSave = async (department) => {
    setLoading(true); // Set state loading ke true saat data sedang disimpan
    try {
      const response = await axios({ // Mengirim permintaan HTTP ke server
        method: department.id ? 'PUT' : 'POST', // Menggunakan PUT untuk pembaruan, POST untuk pembuatan
        url: `http://localhost:5000/api/departments/${department.id || ''}`, // Endpoint URL
        data: department, // Data yang dikirimkan di body permintaan
        headers: { 'Content-Type': 'application/json' }, // Header permintaan
      });
  
      if (response.status !== 200 && response.status !== 201) { // Memeriksa status yang berhasil
        throw new Error(`HTTP error! status: ${response.status}`); // Melempar error jika status tidak OK
      }
  
      fetchDepartments(); // Memperbarui data departemen setelah penyimpanan
      setShowModal(false); // Menutup modal setelah penyimpanan
      setSelectedDepartment(null); // Menghapus state departemen yang dipilih
      setNotification({ type: 'success', message: 'Department saved successfully!' }); // Menampilkan notifikasi keberhasilan
    } catch (error) {
      console.error('Error saving department:', error.message); // Menampilkan error jika penyimpanan gagal
      if (error.response) {
        if (error.response.status === 400) { // Menangani error 400 secara khusus
          setNotification({ type: 'error', message: error.response.data.error || 'Gagal menyimpan department' }); // Menampilkan pesan kesalahan spesifik
        } else {
          setNotification({ type: 'error', message: 'Failed to save department: An unexpected error occurred' }); // Menampilkan pesan kesalahan umum
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to save department: An unexpected error occurred' }); // Menampilkan pesan kesalahan untuk masalah jaringan
      }
    } finally {
      setLoading(false); // Set state loading ke false setelah penyimpanan selesai
    }
  };

  // Fungsi untuk menangani penghapusan departemen
  const handleDelete = async (id) => {
    setLoading(true); // Set state loading ke true saat proses penghapusan
    try {
      const response = await axios.delete(`http://localhost:5000/api/departments/${id}`); // Mengirim permintaan DELETE ke server

      if (response.status !== 200) { // Memeriksa status yang berhasil
        throw new Error(`Http error! status: ${response.status}`); // Melempar error jika status tidak OK
      }

      fetchDepartments(); // Memperbarui data departemen setelah penyimpanan
      setShowConfirmDeleteModal(false); // Menutup modal konfirmasi penghapusan
      setNotification({ type: 'success', message: 'Department deleted successfully!' }); // Menampilkan notifikasi keberhasilan
    } catch (error) {
      console.error('Error deleting department:', error.message); // Menampilkan error jika penghapusan gagal
      setNotification({ type: 'error', message: `Failed to delete department: ${error.message} `}); // Menampilkan notifikasi kesalahan
    } finally {
      setLoading(false); // Set state loading ke false setelah penghapusan selesai
    }
  };

  // Fungsi untuk menangani pemusnahan (penghapusan permanen) departemen
  const handleDestroy = async (id) => {
    setLoading(true); // Set state loading ke true saat proses pemusnahan
    try {
      const response = await axios.delete(`http://localhost:5000/api/departments/${id}/destroy`); // Mengirim permintaan DELETE ke endpoint pemusnahan

      if (response.status !== 200) { // Memeriksa status yang berhasil
        throw new Error(`HTTP error! status: ${response.status}`); // Melempar error jika status tidak OK
      }

      fetchDepartments(); // Memperbarui data departemen setelah pemusnahan
      setShowConfirmDestroyModal(false); // Menutup modal konfirmasi pemusnahan
      setNotification({ type: 'success', message: 'Department permanently deleted!' }); // Menampilkan notifikasi keberhasilan
    } catch (error) {
      console.error('Error destroying department', error.message); // Menampilkan error jika pemusnahan gagal
      setNotification({ type: 'error', message: `Failed to destroy department: ${error.message}` }); // Menampilkan notifikasi kesalahan
    } finally {
      setLoading(false); // Set state loading ke false setelah pemusnahan selesai
    }
  };

  // funsgi untuk menangani restore department
  const handleRestore = async (id) => {
    setLoading(true); // set state loading ke true
    try {
      const response = await axios.put(`http://localhost:5000/api/departments/${id}/restore`); // mengirim permintaan PUT ke endpoint restore

      if (response.status !== 200) { // memeriksa status yang berhasil
        throw new Error(`HTTP error! status: ${response.status}`); // melempar error jika status !OK
      }

      fetchDepartments(); // memperbarui data setelah restore
      setShowConfirmRestoreModal(false); // menutup modal restore
      setNotification({ type: 'success', message: 'Department restored successfully!' }) // menampilkan notif berhasil
    } catch (error) {
      console.error('Error restoring department:', error.message); // menampilkan error jika restore gagal
      setNotification({ type: 'error', message: `Failed to restore department: ${error.message}` }) // menampilkan notif kesalahan
    } finally {
      setLoading(false); // set state loading ke false setelah restore selesai
    }
  };

  // Fungsi untuk menangani klik tombol edit departemen
  const handleEdit = (department) => {
    setSelectedDepartment(department); // Mengatur departemen yang dipilih untuk di-edit
    setShowModal(true); // Menampilkan modal untuk mengedit departemen
  };

  // Fungsi untuk menangani penambahan departemen baru
  const handleAdd = () => {
    // Mengatur state 'selectedDepartment' ke 'null' karena ini adalah operasi penambahan,
    // sehingga tidak ada departemen yang sedang dipilih (tidak ada data departemen lama)
    setSelectedDepartment(null);
    // Menampilkan modal (form) untuk menambahkan departemen baru
    setShowModal(true);
  };

  // Fungsi untuk menangani klik tombol hapus
  const showDeleteConfirmModal = (id, name) => {
    setDeleteId(id); // Menyimpan ID departemen yang akan dihapus
    setSelectedDepartment({ id, name, description: '' }); // Menyimpan ID, Name dan deskripsi departemen yang akan dihapus
    setShowConfirmDeleteModal(true); // Menampilkan modal konfirmasi penghapusan
  };

  // Fungsi untuk menangani klik tombol destroy
  const showDestroyConfirmModal = (id, name) => {
    setDestroyId(id); // Menyimpan ID departemen yang akan dihapus
    setSelectedDepartment({ id, name, description: '' }); // Menyimpan ID, Name dan deskripsi departemen yang akan dihapus
    setShowConfirmDestroyModal(true); // Menampilkan modal konfirmasi destroy
  };

  // fungsi untuk menangani klik tombol restore
  const showRestoreConfirmModal = (id, name) => {
    setRestoreId(id); // menyimpan id yang akan direstore
    setSelectedDepartment({ id, name, description: '' }); // menyimpan id, name dan desc department yang akan di restore
    setShowConfirmRestoreModal(true); // menampilkan confirm restore modal
  };

  // Fungsi untuk menangani perubahan pada input pencarian
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Memperbarui state pencarian dengan nilai input pengguna
    setCurrentPage(1); // Mengatur ulang halaman ke 1 saat melakukan pencarian baru
  };

  // Menggunakan useEffect untuk mengatur fokus pada input pencarian saat halaman dimuat
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Mengatur fokus pada input pencarian
    }
  }, [searchTerm, departments, currentPage, showDeleted]); // fungsi ini akan dijlankan kembali bila cuurrenge, searchtem dan showdelete berubah

  // useEffect ini akan dijalankan setiap kali nilai 'showDeleted' berubah
  useEffect(() => {
    setSearchTerm(''); // Mengosongkan kata kunci pencarian ketika 'showDeleted' berubah
    setCurrentPage(1); // Mengatur halaman saat ini ke halaman pertama setiap kali 'showDeleted' berubah
  }, [showDeleted]); // fungsi ini akan dijlankan kembali bila showdeleted berubah

  // Fungsi untuk menangani perubahan halaman
  const handlePageChange = (page) => {
    setCurrentPage(page); // Memperbarui state currentPage dengan nilai halaman baru yang dipilih
  };

  // Fungsi untuk memformat tanggal ke dalam format yang lebih mudah dibaca
  function formatDate(dateString) {
    // Mengonversi string tanggal yang diterima menjadi objek Date JavaScript
    const date = new Date(dateString);

    // Menggunakan fungsi format dari date-fns untuk memformat objek Date ke format yang diinginkan
    // Formatnya: 'dd MMMM yyyy, HH:mm:ss' (contoh: '28 Agustus 2024, 15:30:45')
    // Locale enUS digunakan untuk memastikan format tanggal dalam bahasa Inggris AS
    return format(date, "dd MMMM yyyy, HH:mm:ss", { locale: enUS });
  };

  return (
    <Container>
      {/* Tombol untuk menampilkan atau menyembunyikan departemen yang sudah dihapus */}
      {/* Component untuk mengelola tombol radio */}
      <ToggleButtonGroup
        type="radio"
        name="status-options"
        value={showDeleted ? 'inactive' : 'active'} // Mengontrol nilai berdasarkan state
        onChange={(val) => setShowDeleted(val === 'inactive')} // Mengubah state berdasarkan nilai yang dipilih
        className="mb-2"
      >
        {/* Tombol radio untuk menampilkan department aktif */}
        <ToggleButton
          id="radio-active"
          type="radio"
          variant="outline-secondary"
          value="active"
          checked={!showDeleted} // Checked jika showDeleted false
        >
          Active
        </ToggleButton>

        {/* Tombol radio untuk menampilkan department yang telah dihapus */}
        <ToggleButton
          id="radio-inactive"
          type="radio"
          variant="outline-secondary"
          value="inactive"
          checked={showDeleted} // Checked jika showDeleted true
        >
          Inactive
        </ToggleButton>
      </ToggleButtonGroup>
      <Card className="mt-3">
        <Card.Header>Department Management</Card.Header>
        <Card.Body>
          {/* Tombol untuk menambahkan departemen baru, hanya muncul jika 'showDeleted' bernilai false */}
          {!showDeleted && (
            <Button className="mb-3" onClick={handleAdd}>Add Department</Button>
          )}
          
          {/* Notifikasi jika ada pesan kesalahan atau keberhasilan */}
          {notification && (
            <Toast
              onClose={() => setNotification(null)} // Menutup notifikasi saat di-klik
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
          {/* Spinner/loading indicator muncul saat data sedang diambil */}
          {loading && <Spinner animation="border" />}
          {!loading && (
            <>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3"
                ref={searchInputRef}
              />
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>{(showDeleted ? 'Deleted At' : 'Updated At')}</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department, index) => (
                    <tr key={department.id}>
                      <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                      <td>{department.name}</td>
                      <td>{department.description}</td>
                      <td>{formatDate(department.createdAt)}</td>
                      <td>{formatDate(showDeleted ? department.deletedAt : department.updatedAt)}</td>
                      <td>
                        <ButtonGroup>
                          {/* Tindakan edit dan hapus, hanya muncul jika 'showDeleted' bernilai false */}
                          {!showDeleted && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Edit</Tooltip>}
                              >
                                <Button
                                  variant="warning"
                                  onClick={() => handleEdit(department)}
                                >
                                  <BsPencilSquare />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Delete</Tooltip>}
                              >
                                <Button
                                  variant="danger"
                                  onClick={() => showDeleteConfirmModal(department.id, department.name)}
                                >
                                  <BsTrash />
                                </Button>
                              </OverlayTrigger>
                            </>
                          )}

                          {/* Tombol untuk menghapus permanen, hanya muncul jika 'showDeleted' bernilai true */}
                          {showDeleted && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Restore</Tooltip>}
                              >
                                <Button
                                  variant="success"
                                  onClick={() => showRestoreConfirmModal(department.id, department.name)}
                                >
                                  <BsArrowClockwise />
                                </Button> 
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Destroy</Tooltip>}
                              >
                                <Button
                                  variant="danger"
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
              
              <Pagination>
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
        </Card.Body>
      </Card>

      <DepartmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSave}
        department={selectedDepartment}
      />

      <ConfirmDeleteModal
        show={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleDelete={handleDelete}
        departmentId={deleteId}
        departmentName={selectedDepartment?.name || ''}
      />

      <ConfirmDestroyModal
        show={showConfirmDestroyModal}
        handleClose={() => setShowConfirmDestroyModal(false)}
        handleDestroy={handleDestroy}
        departmentId={destroyId}
        departmentName={selectedDepartment?.name || ''}
      />

      <ConfirmRestoreModal
        show={showConfirmRestoreModal}
        handleClose={() => setShowConfirmRestoreModal(false)}
        handleRestore={handleRestore}
        departmentId={restoreId}
        departmentName={selectedDepartment?.name || ''}
      />
    </Container>
  );
}

export default DepartmentPage;