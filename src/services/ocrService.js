const sharp = require('sharp');
const { fromPath } = require('pdf2pic');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const tf = require('@tensorflow/tfjs-node');

// Ensure the temporary directory exists
const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

class DocumentProcessingService {
  // Processes an uploaded file by converting and enhancing it for OCR.
  async process(file) {
    // Determine file type and delegate to the appropriate handler
    if (file.mimetype === 'application/pdf') {
      // Convert PDF to images if needed
      return await this.convertPdfToImages(file.path);
    } else {
      // Directly preprocess a single image file
      return await this.preprocessImage(file.path);
    }
  }

  // Preprocesses a single image to improve OCR accuracy.
  async preprocessImage(inputPath) {
    const timestamp = Date.now();
    const originalName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(tempDir, `processed_${originalName}_${timestamp}.png`);

    await sharp(inputPath)
      // Resize for consistency without enlarging small images
      .resize(1500, null, { fit: 'inside', withoutEnlargement: true })
      // Normalize to enhance contrast, crucial for OCR
      .normalize()
      // Apply a mild sharpening effect
      .sharpen()
      // Convert to grayscale which can improve OCR on some documents
      .grayscale()
      // Save as a high-quality PNG
      .toFile(outputPath);
      
    // Return path in an array for a consistent return type from the process() method
    return [outputPath];
  }

  // Converts all pages of a PDF file into preprocessed images.
  async convertPdfToImages(pdfPath) {
    const options = {
      density: 300, // DPI: Good resolution for OCR
      saveFilename: `page_${Date.now()}`,
      savePath: tempDir,
      format: 'png',
      width: 1500
    };

    const convert = fromPath(pdfPath, options);
    // Use .bulk(-1) to convert all pages of the PDF
    const conversionResults = await convert.bulk(-1, { responseType: 'image' });

    if (!conversionResults || conversionResults.length === 0) {
      throw new Error('PDF conversion failed or produced no images.');
    }
    
    // Now, run each converted page through the standard image preprocessor
    const processedImagePaths = [];
    for (const result of conversionResults) {
      // The result.path gives the location of the converted (but not yet processed) image
      const processedPaths = await this.preprocessImage(result.path);
      processedImagePaths.push(...processedPaths);
      // Clean up the raw converted image
      fs.unlinkSync(result.path); 
    }

    return processedImagePaths;
  }
}

// Extract text from an image using Tesseract.js
async function extractText(imagePath, options = {}) {
  // Explicitly set the path for language data
  const worker = Tesseract.createWorker({
    langPath: path.join(__dirname, '../../models/tesseract'),
    // Optionally add a logger here
  });

  await worker.load();
  await worker.loadLanguage(options.language || 'eng');
  await worker.initialize(options.language || 'eng');

  const { data } = await worker.recognize(imagePath, options);
  await worker.terminate();
  return data.text;
}

// Placeholder for loading the TrOCR model from the specified path
async function loadTrOCRModel() {
  const modelPath = path.join(__dirname, '../../models/trocr/pytorch_model.bin');
  console.log(`Loading TrOCR model from: ${modelPath}`);
  // const model = await tf.loadLayersModel(`file://${modelPath}`); // Actual TFJS loading logic
  return null; // Placeholder return
}

// Export a singleton instance of the service and the new functions
module.exports = Object.assign(
  new DocumentProcessingService(),
  {
    extractText,
    loadTrOCRModel
  }
);