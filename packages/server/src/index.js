const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: false,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Cache-Control'],
        exposedHeaders: ['X-RateLimit-Remaining'],
        optionsSuccessStatus: 204,
    })
);
app.use(express.json());

const projectRoutes = require('./routes/projects');
const answerRoutes = require('./routes/answer');

app.use('/project', projectRoutes);
app.use('/answer', answerRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
