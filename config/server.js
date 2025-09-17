module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  tempPath: './uploads/temp'
};