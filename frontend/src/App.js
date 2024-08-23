import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container, Nav, Navbar } from 'react-bootstrap';
import DepartmentPage from './pages/departments/DepartmentPage';
import Dashboard from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div>
        {/* Navigasi */}
        <Navbar bg="light" expand="md" className="border-bottom">
          <Container fluid>
            <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">myApp</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/departments">Departments</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Routing */}
        <Container className="mt-3">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentPage />} />
            {/* Tambahkan rute lain sesuai kebutuhan */}
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
