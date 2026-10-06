const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Server is rubjbnning!');
});

// Start the server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});