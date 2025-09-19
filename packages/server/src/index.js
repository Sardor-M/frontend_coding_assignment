const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

/* cors enabled for all origins */
app.use(
    cors({
        origin: '*',
        credentials: false,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept'],
    })
);

app.use(express.json());

/* here we handle the preflight requests */
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.sendStatus(204);
});

const projectRoutes = require('./routes/projects');
const answerRoutes = require('./routes/answer');

app.use('/project', projectRoutes);
app.use('/answer', answerRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.json({
        status: 'Backend BFF is running',
        endpoints: ['/health', '/project', '/answer'],
        cors: 'enabled for all origins',
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CORS enabled for all origins');
});
