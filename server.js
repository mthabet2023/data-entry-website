require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google Sheets Authentication
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Routes
app.get('/api/sheets', async (req, res) => {
    try {
        const { sheet } = req.query;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: `${sheet}!A2:C`, // Skip header row
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/sheets', async (req, res) => {
    try {
        const { sheet } = req.query;
        const { values } = req.body;

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: `${sheet}!A2:C`,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to append data' });
    }
});

app.put('/api/sheets', async (req, res) => {
    try {
        const { values, range } = req.body;

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'view.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
