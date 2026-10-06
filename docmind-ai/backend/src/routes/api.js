const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

// Configure multer for memory storage to avoid disk writes temporarily
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload - receives file via multer, forwards to Python service
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create form data to send to RAG service
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward to RAG service
    const response = await axios.post(`${process.env.RAG_SERVICE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.json({
      success: true,
      fileId: response.data.fileId,
      message: 'File uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorDetail = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to upload file';
    res.status(statusCode).json({
      error: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
    });
  }
});

// POST /api/ask - forwards { question, fileId } to Python service, returns answer + sources
router.post('/ask', async (req, res) => {
  try {
    const { question, fileId } = req.body;

    if (!question || !fileId) {
      return res.status(400).json({ error: 'Question and fileId are required' });
    }

    const ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${ragUrl}/ask`, {
      question: question,
      fileId: fileId
    });

    res.json(response.data);
  } catch (error) {
    console.error('Ask error:', error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorDetail = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to process question';
    res.status(statusCode).json({
      error: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
    });
  }
});

module.exports = router;