import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiMessageSquare, FiRotateCcw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaRegFileAlt, FaFilePdf, FaFileWord, FaFileAlt } from 'react-icons/fa';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const validExtension = /\.(pdf|docx|txt)$/i.test(file.name);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (!validExtension && !allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const apiEndpoint = window.location.port === '5173' ? '/api/upload' : 'http://localhost:5000/api/upload';
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadedFile(response.data.fileId);
      setUploadedFileName(file.name);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: `Uploaded "${file.name}" successfully! You can now ask questions about it.`,
          isUser: false,
          isSystem: true,
        },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to upload file.';
      alert(`Upload failed: ${errMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !uploadedFile) return;
    if (isThinking) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    setIsThinking(true);
    try {
      const apiEndpoint = window.location.port === '5173' ? '/api/ask' : 'http://localhost:5000/api/ask';
      const response = await axios.post(apiEndpoint, {
        question: currentInput,
        fileId: uploadedFile,
      });
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        sources: response.data.sources,
        isUser: false,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Ask error:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
          isUser: false,
          isError: true,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background/50 backdrop-blur-sm border-b border-border/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FiMessageSquare className="h-6 w-6 text-accent-teal" />
            <h1 className="text-xl font-bold text-text-primary">Document Chat</h1>
          </div>
          {uploadedFile && (
            <div className="flex items-center space-x-3 text-text-secondary">
              <FaRegFileAlt className="h-5 w-5 text-accent-teal" />
              <span className="font-medium text-text-primary">{uploadedFileName || 'Document'}</span>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setUploadedFileName('');
                  setMessages([]);
                }}
                className="text-xs px-2.5 py-1 rounded bg-border/40 hover:bg-border/70 text-text-secondary hover:text-accent-teal transition-all"
              >
                Change Document
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* File upload area */}
          {!uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="drop-area glass-card p-12 text-center border-dashed hover:border-accent-teal transition-all duration-300"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="py-8 flex flex-col items-center">
                  <FiRotateCcw className="h-10 w-10 mb-4 text-accent-teal animate-spin" />
                  <p className="text-lg font-semibold text-text-primary">Processing Document...</p>
                  <p className="text-sm text-text-secondary mt-1">Extracting text and generating vector embeddings</p>
                </div>
              ) : (
                <>
                  <FiUpload className="h-8 w-8 mb-4 text-accent-teal mx-auto" />
                  <p className="mb-2 text-text-primary font-medium">Drag & drop your document here</p>
                  <p className="text-text-secondary text-sm mb-3">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary px-6 py-2"
                  >
                    Browse Files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  <p className="mt-4 text-xs text-text-secondary">
                    Supported formats: PDF, DOCX, TXT
                  </p>
                </>
              )}
            </motion.div>
          )}

          {/* Chat messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
            {isThinking && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-teal/20 rounded-lg flex items-center justify-center">
                  <FiRotateCcw className="h-4 w-4 text-accent-teal animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-text-secondary">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input area */}
      {!uploadedFile && (
        <div className="px-6 py-4 bg-background/50 backdrop-blur-sm border-t border-border/20">
          <p className="text-text-center text-text-secondary">
            Please upload a document to start chatting.
          </p>
        </div>
      )}
      {uploadedFile && (
        <form onSubmit={handleSendMessage} className="px-6 py-4 bg-background/50 backdrop-blur-sm border-t border-border/20">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your document..."
              className="flex-1 input-field placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent-teal/50"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function MessageCard({ message }) {
  const isUser = message.isUser;
  const isSystem = message.isSystem;
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isSystem && !isError && !isUser && (
        <div className="flex-shrink-0 h-10 w-10 bg-accent-teal/20 rounded-lg flex items-center justify-center">
          <FiMessageSquare className="h-4 w-4 text-accent-teal" />
        </div>
      )}
      <div
        className={`message-card glass-card p-4 max-w-2xl ${isUser
            ? 'bg-border/20 ml-4'
            : isSystem || isError
              ? 'bg-border/10 mx-4'
              : 'bg-accent-teal/10'
          }`}
      >
        <p className="text-text-primary">{message.text}</p>
        {!isUser && !isSystem && !isError && message.sources && (
          <div className="mt-2 text-text-secondary/80 text-xs">
            Sources: {message.sources.map((s, i) => (
              <span key={i} className="mx-1">
                {s.page || s.source}
              </span>
            ))}
          </div>
        )}
      </div>
      {isSystem && (
        <div className="ml-4 text-text-secondary text-xs italic">
          {message.text}
        </div>
      )}
      {isError && (
        <div className="ml-4 text-text-error text-xs">
          {message.text}
        </div>
      )}
    </motion.div>
  );
}