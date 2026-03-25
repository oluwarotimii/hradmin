const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle SPA routing - all routes should serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Use the port provided by cPanel/Passenger
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Femtech HR Admin is running on port ${PORT}`);
  console.log(`Access at: https://hradmin.tripa.com.ng`);
});
