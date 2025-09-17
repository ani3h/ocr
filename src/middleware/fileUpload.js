// Import the pre-configured Multer instance from our utility file.
const multer = require('multer');
const { upload } = require('../utils/fileHandler');

// It uses the 'upload.single("file")' method, expecting a single file from a form field named "file".
const handleFileUpload = (req, res, next) => {
  // This function executes the Multer upload middleware.
  const processFile = upload.single('file');

  processFile(req, res, (error) => {
    if (error) {
      // Handle specific Multer errors for better user feedback
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File is too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE || '10MB'}.`
          });
        }
        // A different Multer error occurred (e.g., wrong field name).
        return res.status(400).json({ success: false, message: error.message });
      }

      // Handle errors from our custom fileFilter (e.g., wrong file type)
      return res.status(400).json({
        success: false,
        message: error.message || 'An error occurred during file upload.'
      });
    }

    // Ensure a file was actually uploaded.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded. The "file" field is required.'
      });
    }

    next();
  });
};

module.exports = handleFileUpload;