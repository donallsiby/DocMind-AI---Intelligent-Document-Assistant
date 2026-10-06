require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5000,
  RAG_SERVICE_URL: process.env.RAG_SERVICE_URL || 'http://localhost:8000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

module.exports = config;