// Compare extracted fields with submitted data and calculate confidence scores.
function verifyFields(extractedFields, submittedData) {
  const report = {
    matches: {},
    mismatches: {},
    overallConfidence: 0,
    totalFields: 0,
    matchedFields: 0,
  };

  let confidenceSum = 0;
  let fieldCount = 0;
  let matchedCount = 0;

  for (const [field, submittedValue] of Object.entries(submittedData)) {
    fieldCount++;
    const extracted = extractedFields[field];
    if (extracted) {
      const isMatch = normalizeString(extracted.value) === normalizeString(submittedValue);
      confidenceSum += extracted.confidence || 0;
      if (isMatch) {
        matchedCount++;
        report.matches[field] = {
          extracted: extracted.value,
          submitted: submittedValue,
          confidence: extracted.confidence,
        };
      } else {
        report.mismatches[field] = {
          extracted: extracted.value,
          submitted: submittedValue,
          confidence: extracted.confidence,
        };
      }
    } else {
      report.mismatches[field] = {
        extracted: null,
        submitted: submittedValue,
        confidence: 0,
      };
    }
  }

  report.totalFields = fieldCount;
  report.matchedFields = matchedCount;
  report.overallConfidence = fieldCount ? (confidenceSum / fieldCount) : 0;

  return report;
}

// Normalize string for comparison (case-insensitive, trim, remove extra spaces)
function normalizeString(str) {
  return (str || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
}

module.exports = {
  verifyFields,
};