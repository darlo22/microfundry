const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Basic user endpoint
app.get('/api/user', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});