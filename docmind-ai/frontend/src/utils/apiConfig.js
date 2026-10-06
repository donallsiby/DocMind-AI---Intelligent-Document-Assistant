import axios from 'axios';

const STORAGE_KEY = 'docmind_api_url';

export const getStoredApiUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setStoredApiUrl = (url) => {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY, cleaned);
  }
  // Dispatch custom event so listeners can update state
  window.dispatchEvent(new Event('docmind_api_url_changed'));
};

export const isProductionCloud = () => {
  return (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  );
};

export const getApiBaseUrl = () => {
  // 1. Manually configured by user in UI settings (stored in localStorage)
  const stored = getStoredApiUrl();
  if (stored) {
    return stored.startsWith('http') ? stored : `https://${stored}`;
  }

  // 2. Injected via build-time environment variable (VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL.trim();
    if (envUrl) {
      return (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`).replace(/\/+$/, '');
    }
  }

  // 3. Localhost development fallback
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.port === '5173' ? '' : 'http://localhost:5000';
    }
  }

  // 4. Default: empty relative path
  return '';
};

export const testApiHealth = async (candidateUrl) => {
  let target = (candidateUrl || getApiBaseUrl()).trim().replace(/\/+$/, '');
  if (!target && !isProductionCloud()) {
    target = 'http://localhost:8000';
  }
  if (!target) {
    return { ok: false, error: 'No API URL provided' };
  }

  // Ensure HTTPS on cloud to prevent Mixed Content blocking
  if (target.startsWith('http://') && (isProductionCloud() || target.includes('.onrender.com'))) {
    target = target.replace(/^http:\/\//i, 'https://');
  } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `https://${target}`;
  }

  try {
    const res = await axios.get(`${target}/health`, { timeout: 60000 });
    if (res.status === 200 && (res.data?.status === 'healthy' || res.data?.message)) {
      return { ok: true, url: target, data: res.data };
    }
    return { ok: false, error: `Unexpected response status: ${res.status}` };
  } catch (err) {
    let errorMsg = err.response?.data?.detail || err.message || 'Failed to connect to backend';
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      errorMsg = 'Connection timed out (backend instance may still be spinning up, please try again)';
    } else if (err.message?.includes('Network Error')) {
      errorMsg = 'Network Error (check if service is Live on Render and URL is correct)';
    }
    return {
      ok: false,
      error: errorMsg,
      url: target,
    };
  }
};
