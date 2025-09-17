const path = require('path');
const fs = require('fs');
const os = require('os');
const ocrService = require('../services/ocrService');
const documentProcessing = require('../services/documentProcessingService');

// Handle OCR extraction requests
exports.extractText = async (req, res, next) => {
  // A temporary directory for processing files
  let tempDir = null;
  try {
    // Validate that a file was actually uploaded
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded. Please provide a file.' });
    }

    // Create a unique temporary directory for this request
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));

    // Process the uploaded document (e.g., convert PDF to images, apply preprocessing)
    const processedImages = await documentProcessing.process(req.file.path, tempDir);
    if (!processedImages || processedImages.length === 0) {
      return res.status(500).json({ error: 'Document processing failed to produce images.' });
    }

    // Run OCR extraction for each processed image (to support multi-page documents)
    const results = [];
    for (const imgPath of processedImages) {
      // Assumes ocrService.extractText returns an object like { text: '...', confidence: 95.5 }
      const extractedData = await ocrService.extractText(imgPath);
      results.push(extractedData);
    }

    // Structure the final JSON response with page numbers and confidence scores
    const structuredData = results.map((pageResult, index) => ({
      page: index + 1,
      text: pageResult.text || '',
      confidence: pageResult.confidence || 0,
    }));

    // Respond to the client with the successful result
    res.json({
      success: true,
      pages: structuredData.length,
      data: structuredData,
      processingTime: `${Date.now() - (req.startTime || Date.now())}ms` // Calculate total time taken
    });

  } catch (error) {
    // Pass any errors to the global error handler
    next(error);
  } finally {
    // Clean up temporary files and directories regardless of success or failure
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    // Also remove the original uploaded file from multer's temp storage
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete original uploaded file:", err);
        });
    }
  }
};