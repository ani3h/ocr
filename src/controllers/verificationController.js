const verificationService = require('../services/verificationService');

// Handles data verification requests by comparing submitted data against extracted data.
exports.verifyData = async (req, res, next) => {
  try {
    const { originalDocument, extractedData, submittedData } = req.body;

    // Validate input data structure
    if (!originalDocument || !extractedData || !submittedData) {
      const error = new Error('Missing required fields. The request body must contain originalDocument, extractedData, and submittedData.');
      error.statusCode = 400; // Bad Request
      return next(error);
    }

    if (typeof extractedData !== 'object' || Object.keys(extractedData).length === 0 ||
        typeof submittedData !== 'object' || Object.keys(submittedData).length === 0) {
      const error = new Error('The extractedData and submittedData fields must be non-empty objects.');
      error.statusCode = 400; // Bad Request
      return next(error);
    }

    // Compare extracted vs submitted data using the service layer
    const verificationResult = await verificationService.compare(
      extractedData,
      submittedData
    );

    // Return detailed verification report
    res.status(200).json({
      success: true,
      verification: verificationResult
    });
    
  } catch (error) {
    // Pass any unexpected errors to the global error handler
    next(error);
  }
};