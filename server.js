const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build/client')));

// Handle all routes by serving the Remix app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/client/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
