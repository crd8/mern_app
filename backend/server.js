const express = require('express');
const cors = require('cors'); // import middleware cors, untuk mengizinkan dari sumber yang berbeda, agar memungkinkan frontend berkomunikasi dengan backend
// const morgan = require('morgan'); // menambahkan logging
const app = express();
const port = process.env.PORT || 5000; // gunakan variabel env untuk port

app.use(cors()); // mengaktifkan cors untuk semua rute, memungkinkan aplikasi frontend dari domain yang berbeda untuk mengakses server.
app.use(express.json()); // Middleware untuk parsing request body dalam format JSON, berguna untuk menangani data yang dikirim melalui metode HTTP seperti POST atau PUT
// app.use(morgan('dev')); // logging setiap permintaan

const departmentRoute = require('./routes/departmentRoute'); // Mengimpor rute untuk departemen dari file departmentRoute.js.
const permissionRoute = require('./routes/permissionRoute');
const employeeRoute = require('./routes/employeeRoute');
app.use('/api/departments', departmentRoute); // Menetapkan rute dasar /api/departments untuk semua rute terkait departemen. Semua permintaan ke /api/departments akan diarahkan ke departmentRoute.
app.use('/api/permissions', permissionRoute);
app.use('/api/employees', employeeRoute);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from the backend!' });
});

// Middleware untuk menangani error secara global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// menjalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});