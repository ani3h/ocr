// Optional - for storing results/logs
module.exports = {
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/ocr_project',
    options: { useNewUrlParser: true }
  }
};