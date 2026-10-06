import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CheckCircle2, AlertCircle, RefreshCw, X, ExternalLink, Globe } from 'lucide-react';
import { getStoredApiUrl, setStoredApiUrl, testApiHealth, getApiBaseUrl } from '../utils/apiConfig';

export default function ApiSettingsModal({ isOpen, onClose }) {
  const [urlInput, setUrlInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, message: string }
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getStoredApiUrl() || getApiBaseUrl());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setSaveSuccess(false);

    const result = await testApiHealth(urlInput);
    setTesting(false);
    if (result.ok) {
      setTestResult({ ok: true, message: 'Backend is online and healthy!' });
    } else {
      setTestResult({
        ok: false,
        message: `Connection failed: ${result.error}. (Note: Render free services may take ~50s to wake up from sleep)`
      });
    }
  };

  const handleSave = () => {
    setStoredApiUrl(urlInput.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setStoredApiUrl('');
    setUrlInput('');
    setTestResult(null);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden glass-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-background/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                API Backend Connection
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-border/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Backend API URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://docmind-api-xxxx.onrender.com"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setTestResult(null);
                    setSaveSuccess(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-border/40 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-teal text-sm transition-all"
                />
              </div>
              <p className="text-xs text-text-secondary mt-2 flex items-start space-x-1.5 leading-relaxed">
                <span>💡</span>
                <span>
                  On Render, paste the public URL of your <strong>docmind-api</strong> service from your{' '}
                  <a
                    href="https://dashboard.render.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-teal hover:underline inline-flex items-center gap-0.5"
                  >
                    Render Dashboard <ExternalLink className="w-3 h-3" />
                  </a>.
                </span>
              </p>
            </div>

            {/* Test connection alert */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </motion.div>
            )}

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 bg-background/50">
            <button
              onClick={handleReset}
              className="text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-border/20 transition-all"
            >
              Reset to Default
            </button>
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-3.5 py-2 text-xs font-medium rounded-xl border border-border/50 text-text-primary hover:bg-border/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Checking...' : 'Test Connection'}</span>
              </button>
              <button
                onClick={handleSave}
                className="btn-primary text-xs px-4 py-2"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
