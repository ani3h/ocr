const EXPECTED_FIELDS_BY_TYPE = {
  id_card: ['name', 'id', 'dateOfBirth'],
  form: ['name', 'address', 'signature'],
  certificate: ['name', 'course', 'date'],
  default: [],
};

// Assesses image quality using metrics derived from the OCR output.
const assessImageQuality = (ocrWords) => {
  if (!ocrWords || ocrWords.length === 0) {
    return { overallQuality: 0, confidenceVariance: 1 };
  }

  const confidences = ocrWords.map(w => w.confidence / 100); // Normalize to 0-1
  const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;

  // Calculate the variance of word confidences.
  // A low variance suggests a uniformly clear image, while high variance could indicate blur, shadows, or inconsistent lighting.
  const variance = confidences.map(c => Math.pow(c - mean, 2)).reduce((a, b) => a + b, 0) / confidences.length;
  
  // Create a score that is higher when variance is lower.
  // The multiplier is heuristic and can be tuned.
  const qualityScore = Math.max(0, 1 - Math.sqrt(variance) * 2.5);

  return {
    overallQuality: parseFloat(qualityScore.toFixed(2)),
    confidenceVariance: parseFloat(variance.toFixed(4)),
  };
};

// Calculates a comprehensive confidence score for an OCR result by combining word-level confidence, field detection rates, and image quality metrics.
exports.calculateOverallConfidence = (ocrResults, documentType) => {
  if (!ocrResults || !ocrResults.words || ocrResults.words.length === 0) {
    return {
      overall: 0,
      wordLevelConfidence: 0,
      fieldDetectionConfidence: 0,
      imageQuality: { overallQuality: 0, confidenceVariance: 1 },
    };
  }

  // Word-level confidence aggregation
  const wordConfidences = ocrResults.words.map(w => w.confidence);
  const avgWordConfidence = (wordConfidences.reduce((a, b) => a + b, 0) / wordConfidences.length) / 100;

  // Field detection confidence (calculates the "fill rate")
  const expectedFields = EXPECTED_FIELDS_BY_TYPE[documentType] || EXPECTED_FIELDS_BY_TYPE.default;
  const foundFields = Object.keys(ocrResults.extractedFields || {});
  const foundCount = expectedFields.filter(field => foundFields.includes(field)).length;
  const fieldConfidence = expectedFields.length > 0 ? (foundCount / expectedFields.length) : 1.0;

  // Image quality factors
  const qualityFactors = assessImageQuality(ocrResults.words);

  // Combined confidence score (using a weighted average)
  const weights = { word: 0.60, field: 0.30, quality: 0.10 };
  const combinedScore = 
    (avgWordConfidence * weights.word) +
    (fieldConfidence * weights.field) +
    (qualityFactors.overallQuality * weights.quality);

  return {
    overall: parseFloat(combinedScore.toFixed(2)),
    wordLevelConfidence: parseFloat(avgWordConfidence.toFixed(2)),
    fieldDetectionConfidence: parseFloat(fieldConfidence.toFixed(2)),
    imageQuality: qualityFactors,
  };
};