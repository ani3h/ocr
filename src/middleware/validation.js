// Import the definitions so we don't have to hardcode the allowed types.
const documentTypesConfig = require('../models/documentTypes');

// Validates the request body for the OCR extraction endpoint.
exports.validateOCRRequest = (req, res, next) => {
  const { documentType, language } = req.body;

  // Validate 'documentType' parameter
  if (!documentType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required body field: documentType.' 
    });
  }
  
  const allowedDocTypes = Object.keys(documentTypesConfig);
  if (!allowedDocTypes.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid documentType. Must be one of: ${allowedDocTypes.join(', ')}.`
    });
  }

  // Validate 'language' parameter
  if (!language) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required body field: language.' 
    });
  }

  const allowedLanguages = ['en', 'ar', 'hi']; // As per your project guide
  if (!allowedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      message: `Invalid language. Must be one of: ${allowedLanguages.join(', ')}.`
    });
  }
  
  next();
};

// Validates the request body for the Data Verification endpoint.
exports.validateVerificationRequest = (req, res, next) => {
  const { originalDocument, extractedData, submittedData } = req.body;

  if (!originalDocument || !extractedData || !submittedData) {
    return res.status(400).json({
      success: false,
      message: 'Request body must contain originalDocument, extractedData, and submittedData fields.'
    });
  }

  if (typeof extractedData !== 'object' || typeof submittedData !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'The extractedData and submittedData fields must be objects.'
    });
  }

  next();
};