const express = require('express');
const router = express.Router();

// Import our custom middleware wrapper for file uploads.
const handleFileUpload = require('../middleware/fileUpload');
// Destructure the specific validator we need from our validation middleware.
const { validateOCRRequest } = require('../middleware/validation');
const ocrController = require('../controllers/ocrController');

/**
 * @route   POST /extract
 * @desc    Extracts text and structured data from an uploaded document.
 * @access  Public
 * @body    { file: [file], documentType: "string", language: "string" }
 *
 * This route uses a chain of middleware to process the request:
 * 1. handleFileUpload: Manages the file upload process, validating the file's
 * presence, type, and size based on the central configuration.
 * 2. validateOCRRequest: Validates the other body fields (documentType, language).
 * 3. ocrController.extractText: If all validations pass, this controller
 * handles the core OCR logic.
 */
router.post(
  '/extract',
  handleFileUpload,
  validateOCRRequest,
  ocrController.extractText
);

module.exports = router;