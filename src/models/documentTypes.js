// Defines the structure, fields, and parsing patterns for different document types.
module.exports = {
  // Definition for a standard ID card
  id_card: {
    name: 'Identification Card',
    requiredFields: ['name', 'id', 'dateOfBirth'],
    optionalFields: ['address', 'issueDate', 'expiryDate'],
    patterns: {
      // More flexible regex for names, allowing hyphens, apostrophes, etc.
      name: /(?:Name|Full Name)[:\s]+([A-Za-z\s.'-]+)/i,
      // More flexible regex for ID numbers
      id: /ID\s*(?:Number|No\.?)[:\s]+([A-Z0-9-]+)/i,
      // More flexible regex for date of birth
      dateOfBirth: /(?:DOB|Date of Birth)[:\s]+(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i,
      address: /Address[:\s]+([\w\s,.-]+)/i,
      issueDate: /Issue Date[:\s]+(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i,
      expiryDate: /Expiry Date[:\s]+(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i
    }
  },
  
  // Definition for a generic form
  form: {
    name: 'Generic Form',
    requiredFields: ['applicantName', 'formNumber', 'date'],
    optionalFields: ['address', 'contactNumber', 'signaturePresent'],
    patterns: {
      applicantName: /(?:Applicant Name|Full Name)[:\s]+([A-Za-z\s.'-]+)/i,
      formNumber: /Form\s*(?:No\.?|Number)[:\s]+([A-Z0-9-]+)/i,
      // Completed the missing date pattern
      date: /^Date[:\s]+(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/im,
      address: /Address[:\s]+([\w\s,.-]+)/i,
      contactNumber: /(?:Phone|Contact No\.?)[:\s]+(\+?\d[\d\s-]{8,})/i,
      // A pattern to check for the presence of a signature keyword
      signaturePresent: /(Signature|Signed)/i
    }
  },

  // Added definition for a certificate
  certificate: {
    name: 'Certificate of Achievement',
    requiredFields: ['recipientName', 'achievement', 'issueDate'],
    optionalFields: ['issuingAuthority', 'certificateId'],
    patterns: {
      // Captures the name between common certificate phrases
      recipientName: /(?:This certifies that|is hereby awarded to)\s+([A-Za-z\s.'-]+)/i,
      // Captures the name of the course or achievement
      achievement: /(?:for successfully completing|for achievement in)\s+([A-Za-z0-9\s-':]+)/i,
      // Captures a date, often near the bottom
      issueDate: /Date[d]?[:\s]+((?:\d{1,2}(?:st|nd|rd|th)?\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/i,
      issuingAuthority: /(?:Issued by|Signed by)[:\s]+([A-Za-z\s&,.'-]+)/i,
      certificateId: /Certificate\s*(?:ID|No\.?)[:\s]+([A-Z0-9-]+)/i
    }
  }
};