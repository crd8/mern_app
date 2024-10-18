const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const departmentRoute = require('./routes/departmentRoute');
const permissionRoute = require('./routes/permissionRoute');
const employeeRoute = require('./routes/employeeRoute');

app.use('/api/departments', departmentRoute);
app.use('/api/permissions', permissionRoute);
app.use('/api/employees', employeeRoute);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from the backend!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});