// lightweight library to calculate the difference between two strings
const levenshtein = require('js-levenshtein');

// Compares two date strings for equality.
const compareDates = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);

  // Check if the date strings were parsed successfully
  const isValid1 = !isNaN(d1.getTime());
  const isValid2 = !isNaN(d2.getTime());

  let match = false;
  let confidence = 0.0;

  if (isValid1 && isValid2) {
    // Compare only the date part (YYYY-MM-DD), ignoring time
    if (d1.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10)) {
      match = true;
      confidence = 1.0;
    }
  } else if (!isValid1 && !isValid2 && dateStr1 === dateStr2) {
    // Handle cases where both inputs are invalid but identical (e.g., "N/A")
    match = true;
    confidence = 1.0;
  }

  return { match, confidence, original: dateStr1, submitted: dateStr2 };
};

// Compares two numbers for equality.
const compareNumbers = (num1, num2) => {
  // Sanitize input by removing common formatting like commas
  const cleanNum1 = String(num1).replace(/,/g, '');
  const cleanNum2 = String(num2).replace(/,/g, '');

  const n1 = parseFloat(cleanNum1);
  const n2 = parseFloat(cleanNum2);
  
  const isValid1 = !isNaN(n1);
  const isValid2 = !isNaN(n2);
  
  let match = false;
  let confidence = 0.0;

  if (isValid1 && isValid2) {
    if (n1 === n2) {
      match = true;
      confidence = 1.0;
    }
  } else if (!isValid1 && !isValid2 && num1 === num2) {
    // Handle identical non-numeric strings
    match = true;
    confidence = 1.0;
  }

  return { match, confidence, original: num1, submitted: num2 };
};

// Compares two strings using the Levenshtein distance for fuzzy matching.
const compareStrings = (str1, str2) => {
  const s1 = str1 || '';
  const s2 = str2 || '';

  // An exact match is always 100% confidence
  if (s1.toLowerCase() === s2.toLowerCase()) {
    return { match: true, confidence: 1.0, original: str1, submitted: str2 };
  }

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) {
    return { match: true, confidence: 1.0, original: str1, submitted: str2 };
  }

  const distance = levenshtein(s1.toLowerCase(), s2.toLowerCase());
  const confidence = 1 - (distance / maxLength);

  return {
    match: confidence >= 0.85, // Match if 85% or more similar
    confidence: parseFloat(confidence.toFixed(2)),
    original: str1,
    submitted: str2,
  };
};

// Main comparison function that dispatches to the correct algorithm.
exports.compare = (original, submitted, fieldType) => {
  // Handle null, undefined, or empty cases first
  if (original == null && submitted == null) {
    return { match: true, confidence: 1.0, original, submitted };
  }
  if (original == null || submitted == null) {
    return { match: false, confidence: 0.0, original, submitted };
  }

  // Apply field-specific validation rules
  switch (fieldType) {
    case 'date':
    case 'dateOfBirth':
      return compareDates(original, submitted);
    
    case 'number':
    case 'id':
      return compareNumbers(original, submitted);
    
    case 'name':
    default:
      return compareStrings(String(original), String(submitted));
  }
};