/**
 * HR Admin Dashboard Server
 * Serves the built React frontend
 */

const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle SPA routing - all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Femtech HR Admin serving on port ${PORT}`);
  console.log(`📡 Access at: https://hradmin.tripa.com.ng`);
});
