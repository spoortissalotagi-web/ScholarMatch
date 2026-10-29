/**
 * ScholarMatch - API & Storage Service Layer
 * Supports REST API backend communication with seamless automatic fallback to LocalStorage/Mock
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ScholarAPI = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    SCHEMES: 'scholarmatch_schemes_v1',
    BOOKMARKS: 'scholarmatch_bookmarks_v1',
    LAST_PROFILE: 'scholarmatch_last_profile_v1',
    LAST_RESULTS: 'scholarmatch_last_results_v1'
  };

  const API_BASE = '/api';

  // Helper to determine if backend API is reachable
  let backendAvailable = null;

  async function checkBackend() {
    if (backendAvailable !== null) return backendAvailable;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      backendAvailable = res.ok;
    } catch (e) {
      backendAvailable = false;
    }
    return backendAvailable;
  }

  /**
   * Get all schemes
   */
  async function getAllSchemes() {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/schemes`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(data));
            return data;
          }
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local storage', err);
      }
    }

    // Local Storage / Fallback
    const local = localStorage.getItem(STORAGE_KEYS.SCHEMES);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    // Default static embedded data
    const defaults = (typeof window !== 'undefined' && window.DEFAULT_SCHEMES_DATA) || [];
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Get scheme by ID
   */
  async function getSchemeById(id) {
    const schemes = await getAllSchemes();
    return schemes.find(s => s.id === id) || null;
  }

  /**
   * Run Eligibility Check
   */
  async function checkEligibility(profile) {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/check-eligibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile })
        });
        if (res.ok) {
          const result = await res.json();
          saveProfile(profile);
          saveResults(result);
          return result;
        }
      } catch (e) {
        console.warn('Backend eligibility check failed, executing client-side engine', e);
      }
    }

    // Client-side fallback using EligibilityEngine
    const schemes = await getAllSchemes();
    const evaluated = window.EligibilityEngine 
      ? window.EligibilityEngine.evaluateAll(profile, schemes) 
      : [];

    const summary = {
      total: evaluated.length,
      eligible: evaluated.filter(r => r.matchResult.status === 'eligible').length,
      potential: evaluated.filter(r => r.matchResult.status === 'potential').length,
      notEligible: evaluated.filter(r => r.matchResult.status === 'not-eligible').length,
      profile,
      matches: evaluated,
      timestamp: new Date().toISOString()
    };

    saveProfile(profile);
    saveResults(summary);
    return summary;
  }

  /**
   * Create new scheme (Admin)
   */
  async function createScheme(schemeData) {
    const newId = schemeData.id || `scheme-${Date.now().toString().slice(-4)}`;
    const completeScheme = {
      ...schemeData,
      id: newId,
      isDemo: true
    };

    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/schemes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeScheme)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend create failed, saving to local storage', e);
      }
    }

    // LocalStorage fallback
    const schemes = await getAllSchemes();
    schemes.unshift(completeScheme);
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
    return completeScheme;
  }

  /**
   * Update scheme (Admin)
   */
  async function updateScheme(id, schemeData) {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/schemes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schemeData)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend update failed, updating in local storage', e);
      }
    }

    // LocalStorage fallback
    const schemes = await getAllSchemes();
    const idx = schemes.findIndex(s => s.id === id);
    if (idx !== -1) {
      schemes[idx] = { ...schemes[idx], ...schemeData, id };
      localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
      return schemes[idx];
    }
    throw new Error('Scheme not found');
  }

  /**
   * Delete scheme (Admin)
   */
  async function deleteScheme(id) {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/schemes/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend delete failed, removing from local storage', e);
      }
    }

    // LocalStorage fallback
    let schemes = await getAllSchemes();
    schemes = schemes.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
    return { success: true, id };
  }

  /**
   * Reset to Default Schemes
   */
  async function resetDefaultSchemes() {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/reset-schemes`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(data.schemes));
          return data.schemes;
        }
      } catch (e) {
        console.warn('Backend reset failed', e);
      }
    }

    const defaults = (typeof window !== 'undefined' && window.DEFAULT_SCHEMES_DATA) || [];
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Contact Form submission
   */
  async function submitContactMessage(contactData) {
    const isOnline = await checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
    }

    // Fallback simulation
    return {
      success: true,
      ticketId: 'SM-' + Math.floor(100000 + Math.random() * 900000),
      message: 'Your query has been recorded. Our student counseling desk will respond shortly.'
    };
  }

  // ==========================================
  // BOOKMARKS & PROFILE LOCAL STORAGE HELPERS
  // ==========================================
  function getBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function isBookmarked(schemeId) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.id === schemeId);
  }

  function toggleBookmark(scheme) {
    let bookmarks = getBookmarks();
    const exists = bookmarks.find(b => b.id === scheme.id);
    if (exists) {
      bookmarks = bookmarks.filter(b => b.id !== scheme.id);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return { bookmarked: false, count: bookmarks.length };
    } else {
      bookmarks.unshift({
        id: scheme.id,
        name: scheme.name,
        provider: scheme.provider,
        benefitAmount: scheme.benefitAmount,
        deadline: scheme.deadline,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return { bookmarked: true, count: bookmarks.length };
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PROFILE, JSON.stringify(profile));
    } catch (e) {}
  }

  function getLastProfile() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.LAST_PROFILE);
      return p ? JSON.parse(p) : null;
    } catch (e) {
      return null;
    }
  }

  function saveResults(results) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_RESULTS, JSON.stringify(results));
    } catch (e) {}
  }

  function getLastResults() {
    try {
      const r = localStorage.getItem(STORAGE_KEYS.LAST_RESULTS);
      return r ? JSON.parse(r) : null;
    } catch (e) {
      return null;
    }
  }

  return {
    getAllSchemes,
    getSchemeById,
    checkEligibility,
    createScheme,
    updateScheme,
    deleteScheme,
    resetDefaultSchemes,
    submitContactMessage,
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    saveProfile,
    getLastProfile,
    saveResults,
    getLastResults,
    checkBackend
  };
}));
