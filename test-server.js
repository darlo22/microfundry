const express = require('express');
const { createServer } = require('http');

const app = express();
app.use(express.json());

// Test endpoints
app.get('/api/user', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/campaigns', (req, res) => {
  res.json([{
    id: 1,
    title: 'Test Campaign',
    fundingGoal: '50000.00',
    shortPitch: 'Test campaign for validation'
  }]);
});

app.post('/api/campaigns', (req, res) => {
  const { fundingGoal } = req.body;
  if (fundingGoal && parseFloat(fundingGoal) > 100000) {
    return res.status(400).json({ 
      message: 'Funding goal cannot exceed $100,000',
      limit: 100000
    });
  }
  res.json({ message: 'Campaign created successfully' });
});

app.get('/', (req, res) => {
  res.send('Fundry Test Server - $100k limit enforced');
});

const server = createServer(app);
const port = 5000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});

module.exports = app;