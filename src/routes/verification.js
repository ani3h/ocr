const express = require('express');
const router = express.Router();

// Destructure the specific validator we need for this route.
const { validateVerificationRequest } = require('../middleware/validation');
const verificationController = require('../controllers/verificationController');

/**
 * @route   POST /verify
 * @desc    Verifies submitted data against extracted data from a document.
 * @access  Public
 * @body    { "originalDocument": "string", "extractedData": {}, "submittedData": {} }
 *
 * This route uses a chain of middleware:
 * 1. validateVerificationRequest: Ensures the request body contains all required fields
 * (originalDocument, extractedData, submittedData) in the correct format.
 * 2. verificationController.verifyData: If validation passes, this controller
 * handles the core data comparison logic.
 */
router.post(
  '/verify',
  validateVerificationRequest,
  verificationController.verifyData
);

module.exports = router;