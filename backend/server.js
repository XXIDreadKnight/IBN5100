const express = require('express');
const cors = require('cors'); // To allow requests from your frontend
const app = express();

// Render typically sets the PORT environment variable. For local dev, use 3001.
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for simplicity in this assignment)
app.use(express.json()); // To parse JSON request bodies

// In-memory storage for the latest data
// In a real app, you'd use a database (SQLite, PostgreSQL, MongoDB, etc.)
let latestData = "No data received yet.";

// POST endpoint to receive and store data
app.post('/api/create-answer', (req, res) => {
    console.log("Received POST request to /api/create-answer");
    console.log("Request body:", req.body);

    if (req.body && typeof req.body.data === 'string') {
        latestData = req.body.data;
        console.log("Stored new data:", latestData);
        res.status(201).json({ message: "Data received successfully", currentData: latestData });
    } else {
        console.log("Bad request: 'data' field missing or not a string");
        res.status(400).json({ error: "Invalid request. Body must be JSON with a 'data' field (string)." });
    }
});

// GET endpoint for the frontend to fetch the latest data
app.get('/api/get-answer', (req, res) => {
    console.log("Received GET request to /api/get-answer");
    res.json({ data: latestData });
});

// Basic root route to confirm the server is up
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

app.listen(PORT, '0.0.0.0', () => { // Listen on 0.0.0.0 to be accessible externally if needed
    console.log(`Backend server listening on port ${PORT}`);
});