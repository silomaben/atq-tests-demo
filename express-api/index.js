const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Use the cors middleware
app.use(cors());

// Define a route to fetch student data
app.get('/students', (req, res) => {
    // Read the static JSON file
    fs.readFile('generated_students.json', 'utf8', (
        err,
        data) => {
        if (err) {
            console.error('Error reading JSON file: ', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Parse JSON data
        const students = JSON.parse(data);
        res.json(students);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
