module.exports = {
  tesseractOptions: {
    logger: m => console.log(m),
    language: 'eng+ara+hin'
  },
  trocrModelPath: './models/trocr',
  confidenceThreshold: 0.7,
  preprocessing: {
    resize: { width: 1200, height: 1600 },
    enhance: true,
    denoise: true
  }
};