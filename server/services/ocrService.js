let tesseract;

function getTesseract() {
  if (tesseract !== undefined) return tesseract;
  try {
    // Load OCR only when a scanned/image document actually needs it.
    tesseract = require('tesseract.js');
  } catch {
    tesseract = null;
  }
  return tesseract;
}

async function recognizeImage(buffer) {
  const provider = getTesseract();
  if (!provider) return { text: '', warning: 'OCR is unavailable. Install the optional tesseract.js dependency or enter the resume text manually.' };

  try {
    const result = await provider.recognize(buffer, 'eng');
    const text = result?.data?.text || '';
    return text.trim()
      ? { text, warning: '' }
      : { text: '', warning: 'OCR completed but did not detect readable text.' };
  } catch {
    return { text: '', warning: 'OCR could not read this document. Please verify the file or enter the resume text manually.' };
  }
}

module.exports = { recognizeImage };
