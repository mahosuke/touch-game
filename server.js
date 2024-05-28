const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/save_results', (req, res) => {
    const data = req.body;

    if (!data.name || !data.results) {
        return res.status(400).json({ status: 'error', message: 'Invalid data' });
    }

    const filePath = path.join(__dirname, 'results.json');
    let currentData = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        if (fileData) {
            try {
                currentData = JSON.parse(fileData);
            } catch (err) {
                console.error('Error parsing JSON:', err);
                return res.status(500).json({ status: 'error', message: 'Failed to parse existing data' });
            }
        }
    }

    currentData.push(data);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    res.json({ status: 'success' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
