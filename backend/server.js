const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const departmentRoute = require('./routes/departmentRoute');
app.use('/api/departments', departmentRoute);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from the backend!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});