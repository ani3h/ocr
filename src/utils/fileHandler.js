const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Define the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the upload path from environment variables, with a safe fallback
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwriting existing files
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Define a file filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Use allowed formats from environment variables, split into an array
  const allowedFormats = (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,pdf').split(',');
  const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

  if (allowedFormats.includes(fileExtension)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    const error = new Error('File format not supported! Only ' + allowedFormats.join(', ') + ' are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Create and export the configured Multer instance
exports.upload = multer({
  storage: storage,
  limits: {
    // Set file size limit
    fileSize: parseInt(process.env.MAX_FILE_SIZE) * 1024 * 1024 || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});


// Creates all necessary upload directories if they do not already exist.
exports.ensureUploadDirs = async () => {
  try {
    const tempDir = path.join(process.env.UPLOAD_PATH || 'uploads', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    console.log('Upload directories are ready.');
  } catch (error) {
    console.error('Error ensuring upload directories exist:', error);
  }
};

// Deletes an array of temporary files after processing is complete.
exports.cleanupTempFiles = async (filePaths) => {
  if (!Array.isArray(filePaths)) {
    console.warn('cleanupTempFiles expects an array of file paths.');
    return;
  }
  
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Log a warning instead of throwing an error, as this is a non-critical task.
      console.warn(`Failed to delete temp file: ${filePath}. Error: ${error.message}`);
    }
  }
};