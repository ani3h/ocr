const fs = require('fs');
const path = require('path');
const tempOriginalsPath = path.join(__dirname, '../../uploads/temp/original_files');
const tempProcessedPath = path.join(__dirname, '../../uploads/temp/processed_files');
const { fromPath } = require('pdf2pic');
const sharp = require('sharp');
const fileType = require('file-type');

// Validate if the file is a supported format (PDF or image)
async function validateFormat(filePath) {
  const supportedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/bmp',
  ];
  const buffer = fs.readFileSync(filePath);
  const type = await fileType.fromBuffer(buffer);
  return type && supportedMimeTypes.includes(type.mime);
}

// Convert PDF to images (one per page)
async function pdfToImages(pdfPath, outputDir) {
  const options = {
    density: 300,
    saveFilename: 'page',
    savePath: outputDir,
    format: 'png',
    width: 1654,
    height: 2339,
  };
  const pdf2pic = fromPath(pdfPath, options);
  const numPages = await getPdfPageCount(pdfPath);
  const imagePaths = [];
  for (let i = 1; i <= numPages; i++) {
    const result = await pdf2pic(i);
    imagePaths.push(result.path);
  }
  return imagePaths;
}

// Get number of pages in a PDF
async function getPdfPageCount(pdfPath) {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf.numPages;
}

// Preprocess image: noise reduction and contrast enhancement
async function preprocessImage(imagePath, outputImagePath) {
  // Use more granular processed path
  const outputPath = path.join(tempProcessedPath, `processed_${Date.now()}.png`);
  await sharp(imagePath)
    .median(1) // Noise reduction
    .normalize() // Contrast enhancement
    .toFile(outputPath);
  // Optionally, you can return outputPath if needed
  return outputPath;
}

// Process a document (PDF or image), return array of preprocessed image paths
async function processDocument(filePath, tempDir) {
  if (!(await validateFormat(filePath))) {
    throw new Error('Unsupported file format');
  }

  const type = await fileType.fromFile(filePath);
  let imagePaths = [];

  if (type.mime === 'application/pdf') {
    imagePaths = await pdfToImages(filePath, tempDir);
  } else {
    // Single image file
    const fileName = path.basename(filePath);
    const destPath = path.join(tempDir, fileName);
    fs.copyFileSync(filePath, destPath);
    imagePaths = [destPath];
  }

  // Preprocess all images
  const preprocessedPaths = [];
  for (const imgPath of imagePaths) {
    // Use the preprocessImage signature
    const preprocessedPath = await preprocessImage(imgPath);
    preprocessedPaths.push(preprocessedPath);
  }
  return preprocessedPaths;
}

module.exports = {
  validateFormat,
  pdfToImages,
  preprocessImage,
  processDocument,
};