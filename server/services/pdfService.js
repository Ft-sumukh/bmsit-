const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extracts all raw text from a PDF file using pdf-parse.
 * @param {string} filePath - Absolute path to the local PDF file.
 * @returns {Promise<{text: string, pageCount: number}>} Extracted text and page count.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text || '',
      pageCount: data.numpages || 1
    };
  } catch (error) {
    console.error('PDF parsing service error:', error.message);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF
};
