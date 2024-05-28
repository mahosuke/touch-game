const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to save game results
app.post('/save_results', (req, res) => {
    const gameResults = req.body;

    if (!gameResults || !gameResults.name || !Array.isArray(gameResults.results)) {
        return res.status(400).json({ error: 'Invalid game results data' });
    }

    const filePath = path.join(__dirname, 'game_results.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Error reading file' });
        }

        let results = [];
        if (data) {
            results = JSON.parse(data);
        }

        results.push(gameResults);

        fs.writeFile(filePath, JSON.stringify(results, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing file' });
            }

            res.json({ message: 'Results saved successfully' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
