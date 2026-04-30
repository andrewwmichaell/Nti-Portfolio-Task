const express = require('express');
const cors = require('cors');
const path = require('path');
const projectRoutes = require('./routes/project.routes');
const homeContentRoutes = require('./routes/home-content.routes');
const resumeContentRoutes = require('./routes/resume-content.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/projects', projectRoutes);
app.use('/api/home-content', homeContentRoutes);
app.use('/api/resume-content', resumeContentRoutes);
app.use('/api/contact-messages', contactRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
