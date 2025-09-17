// Main application entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/v1/ocr', require('./routes/ocr'));
app.use('/api/v1/verification', require('./routes/verification'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;