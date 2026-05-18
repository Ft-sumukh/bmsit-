const Document = require('../models/Document');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

// @desc    Upload a PDF document, extract text and save metadata
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a PDF file'));
    }

    const { subject, tags, title } = req.body;
    const filePath = req.file.path;

    // Parse the PDF
    let parsedData;
    try {
      parsedData = await pdfService.extractTextFromPDF(filePath);
    } catch (parseError) {
      // Clean up file if parsing fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(422);
      return next(new Error(`Failed to extract text from PDF: ${parseError.message}`));
    }

    // Save document to database
    const document = await Document.create({
      userId: req.user._id,
      title: title || req.file.originalname.replace(/\.pdf$/i, ''),
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`, // Serving locally in Phase 1
      fileSize: req.file.size,
      extractedText: parsedData.text,
      pageCount: parsedData.pageCount || 1,
      subject: subject || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      vectorNamespace: `ns-${req.user._id}-${Date.now()}` // Namespace mapping for vector DB RAG
    });

    // Link document inside User model list
    req.user.documents.push(document._id);
    await req.user.save();

    res.status(201).json(document);
  } catch (error) {
    // Cleanup physical file on fatal error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    List all documents uploaded by the logged-in student
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select('-extractedText') // Omit extracted text for performance
      .sort({ uploadedAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Get metadata and content for a single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document from DB and disk storage
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    // Attempt to delete local file
    const filePath = path.join(__dirname, '../uploads', document.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fileErr) {
        console.error('Failed to delete physical document file:', fileErr.message);
      }
    }

    // Remove from MongoDB
    await Document.deleteOne({ _id: document._id });

    // Filter user documents list
    req.user.documents = req.user.documents.filter(
      docId => docId.toString() !== document._id.toString()
    );
    await req.user.save();

    res.json({ message: 'Document and its vector namespace deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
};
