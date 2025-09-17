// Defines validation rules and normalization functions for various semantic field types.
module.exports = {
  fieldTypes: {
    name: {
      description: "A person's full name.",
      // Allows for apostrophes, hyphens, and periods in names (e.g., O'Malley, Jean-Luc, Dr. Smith)
      validator: /^[A-Za-z\s.'-]{2,70}$/,
      // Trims and standardizes whitespace.
      normalizer: (value) => value.trim().replace(/\s+/g, ' ')
    },
    id: {
      description: "An alphanumeric identifier, like a driver's license or passport number.",
      // Allows for letters, numbers, and hyphens.
      validator: /^[A-Z0-9-]{5,20}$/i,
      // Removes whitespace/hyphens and converts to uppercase for consistent comparison.
      normalizer: (value) => value.replace(/[\s-]/g, '').toUpperCase()
    },
    date: {
      description: "A calendar date.",
      // A more flexible regex that allows for different separators (/, -, .)
      validator: /^\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}$/,
      // Normalizes various date formats into the standard YYYY-MM-DD.
      normalizer: (value) => {
        try {
          return new Date(value).toISOString().split('T')[0];
        } catch (error) {
          // If parsing fails, return the original malformed value.
          return value;
        }
      }
    },

    address: {
      description: 'A full or partial physical street address.',
      // A simple validator that checks for reasonable length and common address characters.
      validator: /^[\w\s,.'-#]{10,150}$/i,
      normalizer: (value) => value.trim().replace(/\s+/g, ' ').replace(/ ,/g, ',')
    },
    contactNumber: {
      description: 'A phone number, potentially with country code and formatting.',
      // A flexible validator for various phone number formats.
      validator: /^\+?[\d\s-()]{7,20}$/,
      // Normalizer strips all non-digit characters to create a consistent format.
      normalizer: (value) => value.replace(/\D/g, '')
    },
    email: {
      description: 'An email address.',
      // A standard, reasonably strict email validation regex.
      validator: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      normalizer: (value) => value.trim().toLowerCase()
    },
    alphanumeric: {
      description: 'A generic code or identifier with letters and numbers (e.g., form number).',
      validator: /^[A-Z0-9-]{3,30}$/i,
      normalizer: (value) => value.replace(/\s/g, '').toUpperCase()
    },
    genericText: {
      description: 'Any general text field that requires basic cleaning (e.g., achievement, course name).',
      // Validates that the field is not empty and not excessively long.
      validator: /^.{2,100}$/,
      normalizer: (value) => value.trim().replace(/\s+/g, ' ')
    }
  }
};