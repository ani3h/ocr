const sharp = require('sharp');

// A placeholder function to simulate detecting the skew angle of an image.
const detectSkewAngle = async (inputPath) => {
  // This is a placeholder. A real implementation is non-trivial and would
  // replace this function. For now, we assume the image is perfectly aligned.
  // To test the rotation effect, you can return a hardcoded value like: return -2.5;
  return 0;
};

// Enhances an image for better OCR accuracy by cleaning, deskewing, and normalizing it.
exports.enhanceImage = async (inputPath, outputPath) => {
  // Rotation Correction (Deskewing)
  const skewAngle = await detectSkewAngle(inputPath);

  // The processing pipeline is ordered to maximize quality for OCR.
  await sharp(inputPath)
    // Correct the rotation, filling the background with white.
    .rotate(skewAngle, { background: 'white' })
    
    // Convert to grayscale, as color is not needed for most OCR.
    .grayscale()

    // Noise Reduction: A median filter is effective at removing "salt and pepper" noise.
    .median(3)
    
    // Contrast Enhancement: Normalizing stretches the intensity range to full contrast.
    .normalize()
    
    // Sharpen the edges of text to make them more distinct.
    .sharpen({ sigma: 1 })
    
    // Background Removal (Binarization): Create a clean black & white image.
    .threshold(150)
    
    .toFile(outputPath);
    
  return outputPath;
};