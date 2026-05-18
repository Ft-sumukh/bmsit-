const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Select writable directory depending on execution environment (Vercel vs Local)
const uploadDir = process.env.VERCEL 
  ? '/tmp' 
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir) && !process.env.VERCEL) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Escape whitespace and append timestamp
    const cleanFileName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${cleanFileName}`);
  }
});

// PDF file extension filter
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are allowed!'), false);
  }
};

// Configured Multer instance (10MB limit)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
