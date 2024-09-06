import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

function DashboardPage() {
  return (
    <Container>
      <h4 className='fw-bold'>myApp Dashboard</h4>
      <p className='text-body-tertiary'>Be enthusiastic about things that are useful for you, ask <strong>Allah</strong> for help, and don't be lazy (discouraged). (HR. Muslim no. 2664)</p>
    </Container>
  );
}

export default DashboardPage;