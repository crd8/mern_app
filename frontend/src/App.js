import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
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
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav 
                className="me-auto my-2 my-lg-0"
                style={{ maxHeight: '100px' }}
                navbarScroll
              >
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <NavDropdown title='Company' id='basic-nav-dropdown'>
                  <NavDropdown.Item as={Link} to="/departments">Departments</NavDropdown.Item>
                </NavDropdown>
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
