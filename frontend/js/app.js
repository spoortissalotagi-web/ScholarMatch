/**
 * ScholarMatch - Main Application Controller
 * Handles SPA view switching, search, filters, results rendering, and modals.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.App = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentView = 'home';
  let cachedResults = null;
  let cachedAllSchemes = [];
  let resultsFilter = 'all';
  let resultsSort = 'best-match';
  let catalogFilterCategory = 'all';
  let catalogSearchTerm = '';

  function init() {
    bindNavigation();
    bindSearchAndFilters();
    bindContactForm();
    bindModalEvents();
    updateNavBookmarkBadge();

    // Check URL hash for initial route
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash, false);

    // Load initial schemes cache
    window.ScholarAPI.getAllSchemes().then(schemes => {
      cachedAllSchemes = schemes;
      renderScholarshipCatalog();
    });

    // Check if previous results exist in localStorage
    const savedResults = window.ScholarAPI.getLastResults();
    if (savedResults) {
      cachedResults = savedResults;
      renderResults(savedResults);
    }
  }

  // ==========================================
  // NAVIGATION & VIEW SWITCHING
  // ==========================================
  function bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-action-link, [data-navigate]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-navigate') || link.getAttribute('href').replace('#', '');
        if (targetView) {
          navigateTo(targetView);
        }
      });
    });

    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu-list');
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
    }

    // Window popstate / back button support
    window.addEventListener('popstate', (e) => {
      const hash = window.location.hash.replace('#', '') || 'home';
      navigateTo(hash, false);
    });
  }

  function navigateTo(viewName, pushHistory = true) {
    const validViews = ['home', 'checker', 'results', 'scholarships', 'dashboard', 'about', 'contact', 'admin'];
    const target = validViews.includes(viewName) ? viewName : 'home';
    currentView = target;

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${target}`);
    });

    // Update navbar active state
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkView = link.getAttribute('data-navigate') || link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', linkView === target);
    });

    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu-list');
    if (navMenu) navMenu.classList.remove('open');

    // Update browser history
    if (pushHistory) {
      window.history.pushState(null, '', `#${target}`);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific lifecycle callbacks
    if (target === 'dashboard' && window.StudentDashboard) {
      window.StudentDashboard.renderDashboard();
    } else if (target === 'admin' && window.AdminController) {
      window.AdminController.renderSchemesTable();
    } else if (target === 'scholarships') {
      renderScholarshipCatalog();
    } else if (target === 'results' && !cachedResults) {
      // If user navigated to results directly without checking, show a friendly prompt or use last results
      const last = window.ScholarAPI.getLastResults();
      if (last) {
        cachedResults = last;
        renderResults(last);
      }
    }
  }

  // ==========================================
  // RESULTS PAGE RENDERING & FILTERS
  // ==========================================
  function renderResults(resultsData) {
    cachedResults = resultsData;
    if (!resultsData || !Array.isArray(resultsData.matches)) return;

    // Update KPI counters
    const kpiTotal = document.getElementById('kpi-total-checked');
    const kpiEligible = document.getElementById('kpi-eligible-count');
    const kpiPotential = document.getElementById('kpi-potential-count');
    const kpiNot = document.getElementById('kpi-not-eligible-count');
    const bannerTitle = document.getElementById('results-matched-banner-title');
    const bannerSubtitle = document.getElementById('results-matched-banner-subtitle');

    if (kpiTotal) kpiTotal.textContent = resultsData.total;
    if (kpiEligible) kpiEligible.textContent = resultsData.eligible;
    if (kpiPotential) kpiPotential.textContent = resultsData.potential;
    if (kpiNot) kpiNot.textContent = resultsData.notEligible;

    if (bannerTitle) {
      bannerTitle.textContent = `We found ${resultsData.eligible} scholarships matching your profile.`;
    }
    if (bannerSubtitle) {
      const student = resultsData.profile || {};
      bannerSubtitle.textContent = `Evaluation for ${student.name || 'Student'} (${student.educationLevel}, ${student.category}, ${student.percentage}% aggregate, Domicile: ${student.state}).`;
    }

    filterAndRenderResultsCards();
  }

  function filterAndRenderResultsCards() {
    const container = document.getElementById('results-cards-grid');
    if (!container || !cachedResults) return;

    let items = [...cachedResults.matches];

    // Filter by Status
    if (resultsFilter === 'eligible') {
      items = items.filter(i => i.matchResult.status === 'eligible');
    } else if (resultsFilter === 'potential') {
      items = items.filter(i => i.matchResult.status === 'potential');
    } else if (resultsFilter === 'not-eligible') {
      items = items.filter(i => i.matchResult.status === 'not-eligible');
    } else if (resultsFilter === 'state-only') {
      const studentState = (cachedResults.profile && cachedResults.profile.state || '').toLowerCase();
      items = items.filter(i => (i.scheme.state || '').toLowerCase() === studentState);
    } else if (resultsFilter === 'merit-only') {
      items = items.filter(i => (i.scheme.minPercentage || 0) >= 70);
    }

    // Search query on results
    const searchInput = document.getElementById('results-search-input');
    if (searchInput && searchInput.value.trim()) {
      const term = searchInput.value.trim().toLowerCase();
      items = items.filter(i => 
        i.scheme.name.toLowerCase().includes(term) ||
        i.scheme.provider.toLowerCase().includes(term) ||
        (i.scheme.eligibleCategories || []).some(c => c.toLowerCase().includes(term))
      );
    }

    // Sort
    if (resultsSort === 'best-match') {
      items.sort((a, b) => b.matchResult.score - a.matchResult.score);
    } else if (resultsSort === 'highest-benefit') {
      items.sort((a, b) => (b.scheme.benefitAmount || 0) - (a.scheme.benefitAmount || 0));
    } else if (resultsSort === 'deadline') {
      items.sort((a, b) => new Date(a.scheme.deadline) - new Date(b.scheme.deadline));
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 4rem 1rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-weight: 700; margin-bottom: 0.5rem;">No Schemes Match Current Filter</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">
            Try clearing search keywords or selecting "All" in the status filter chips.
          </p>
          <button class="btn btn-secondary btn-sm" onclick="App.resetResultsFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => renderScholarshipCardHtml(item.scheme, item.matchResult)).join('');
  }

  function renderScholarshipCardHtml(scheme, matchResult) {
    const isBookmarked = window.ScholarAPI.isBookmarked(scheme.id);
    const status = matchResult.status;
    const score = matchResult.score;

    let statusLabel = 'Eligible';
    let statusClass = 'status-eligible';
    let statusIcon = '🟢';

    if (status === 'potential') {
      statusLabel = 'Potential Match';
      statusClass = 'status-potential';
      statusIcon = '🟡';
    } else if (status === 'not-eligible') {
      statusLabel = 'Not Eligible';
      statusClass = 'status-not-eligible';
      statusIcon = '🔴';
    }

    const categories = (scheme.eligibleCategories || []).join(', ');
    const levels = (scheme.eligibleEducationLevels || []).join(', ');
    const incomeStr = scheme.maxIncome ? `₹${Number(scheme.maxIncome).toLocaleString('en-IN')}` : 'No Limit';

    // Summary alert for match reasoning
    let reasonAlertHtml = '';
    if (status === 'eligible') {
      reasonAlertHtml = `
        <div class="match-reason-alert alert-eligible">
          <strong>✅ Why You Match:</strong> ${matchResult.matchSummary}
        </div>
      `;
    } else if (status === 'potential') {
      reasonAlertHtml = `
        <div class="match-reason-alert alert-potential">
          <strong>⚠️ Conditional Match:</strong> ${matchResult.reasons[0] || matchResult.warnings[0] || 'Conditional relaxation may apply.'}
        </div>
      `;
    } else {
      reasonAlertHtml = `
        <div class="match-reason-alert alert-not-eligible">
          <strong>❌ Unmet Criteria:</strong> ${matchResult.reasons[0] || matchResult.failedCriteria[0] || 'Prerequisites not met.'}
        </div>
      `;
    }

    return `
      <div class="scholarship-card ${statusClass}" data-id="${scheme.id}">
        <div>
          <!-- Top Row: Score Badge + Tags + Bookmark -->
          <div class="card-top-row">
            <div class="card-badges-wrapper">
              <span class="match-score-badge ${statusClass}">
                ${statusIcon} ${score}% Match (${statusLabel})
              </span>
              <span class="demo-tag">Demo Data</span>
            </div>
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="App.toggleBookmark('${scheme.id}', event)" 
                    title="${isBookmarked ? 'Remove Bookmark' : 'Save Scholarship'}">
              ${isBookmarked ? '❤️' : '🤍'}
            </button>
          </div>

          <!-- Scheme Title & Provider -->
          <h3 class="scheme-card-title">${scheme.name}</h3>
          <div class="scheme-card-provider">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            ${scheme.provider} • <span style="font-weight: 600;">${scheme.state || 'All India'}</span>
          </div>

          <!-- Criteria Specs Grid -->
          <div class="criteria-specs-grid">
            <div class="spec-item">
              <span class="spec-label">Max Family Income</span>
              <span class="spec-val">${incomeStr}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Min Academic Score</span>
              <span class="spec-val">${scheme.minPercentage}% Marks</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Eligible Category</span>
              <span class="spec-val">${categories}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Education Level</span>
              <span class="spec-val">${levels}</span>
            </div>
          </div>

          <!-- Key Benefit Highlight -->
          <div class="benefit-pill-box">
            <span>🎁</span>
            <div><strong>Benefits:</strong> ${scheme.benefits}</div>
          </div>

          <!-- Match Reasoning -->
          ${reasonAlertHtml}
        </div>

        <!-- Action Buttons -->
        <div class="card-actions-row">
          <button class="btn btn-secondary btn-sm" onclick="App.openSchemeModal('${scheme.id}')">
            View Details
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.applyScheme('${scheme.id}')">
            Apply Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EXPLORE SCHOLARSHIPS DIRECTORY
  // ==========================================
  function renderScholarshipCatalog() {
    const container = document.getElementById('catalog-cards-grid');
    const countEl = document.getElementById('catalog-total-count');
    if (!container) return;

    let list = [...cachedAllSchemes];

    // Filter by Category
    if (catalogFilterCategory !== 'all') {
      list = list.filter(s => 
        (s.eligibleCategories || []).some(c => c.toLowerCase() === catalogFilterCategory.toLowerCase())
      );
    }

    // Filter by Search Term
    if (catalogSearchTerm) {
      const term = catalogSearchTerm.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.provider.toLowerCase().includes(term) ||
        (s.state && s.state.toLowerCase().includes(term)) ||
        (s.eligibleEducationLevels || []).some(l => l.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }

    if (countEl) countEl.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 4rem 1rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📚</div>
          <h3 style="font-weight: 700; margin-bottom: 0.4rem;">No Scholarships Found</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your search keywords or filter options.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(scheme => {
      const isBookmarked = window.ScholarAPI.isBookmarked(scheme.id);
      const incomeStr = scheme.maxIncome ? `₹${Number(scheme.maxIncome).toLocaleString('en-IN')}` : 'No Limit';

      return `
        <div class="scholarship-card" data-id="${scheme.id}">
          <div>
            <div class="card-top-row">
              <div class="card-badges-wrapper">
                <span style="background: #eff6ff; color: var(--primary); font-size: 0.78rem; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-sm);">
                  ${scheme.state || 'All India'}
                </span>
                <span class="demo-tag">Demo Data</span>
              </div>
              <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                      onclick="App.toggleBookmark('${scheme.id}', event)" 
                      title="${isBookmarked ? 'Remove Bookmark' : 'Save Scholarship'}">
                ${isBookmarked ? '❤️' : '🤍'}
              </button>
            </div>

            <h3 class="scheme-card-title">${scheme.name}</h3>
            <div class="scheme-card-provider">${scheme.provider}</div>

            <div class="criteria-specs-grid">
              <div class="spec-item">
                <span class="spec-label">Max Family Income</span>
                <span class="spec-val">${incomeStr}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Min Marks</span>
                <span class="spec-val">${scheme.minPercentage}%</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Eligible Categories</span>
                <span class="spec-val">${(scheme.eligibleCategories || []).join(', ')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Education Levels</span>
                <span class="spec-val">${(scheme.eligibleEducationLevels || []).join(', ')}</span>
              </div>
            </div>

            <div class="benefit-pill-box">
              <span>🎁</span>
              <div><strong>Benefits:</strong> ${scheme.benefits}</div>
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn btn-secondary btn-sm" onclick="App.openSchemeModal('${scheme.id}')">View Details</button>
            <button class="btn btn-primary btn-sm" onclick="App.applyScheme('${scheme.id}')">Apply Link</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // EVENT BINDINGS FOR SEARCH & FILTERS
  // ==========================================
  function bindSearchAndFilters() {
    // Results Filter Chips
    const resultChips = document.querySelectorAll('.results-filter-chip');
    resultChips.forEach(chip => {
      chip.addEventListener('click', () => {
        resultChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        resultsFilter = chip.getAttribute('data-filter') || 'all';
        filterAndRenderResultsCards();
      });
    });

    // Results Sort Select
    const sortSelect = document.getElementById('results-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        resultsSort = e.target.value;
        filterAndRenderResultsCards();
      });
    }

    // Results Search Bar
    const resultsSearch = document.getElementById('results-search-input');
    if (resultsSearch) {
      resultsSearch.addEventListener('input', () => {
        filterAndRenderResultsCards();
      });
    }

    // Catalog Search Bar
    const catalogSearch = document.getElementById('catalog-search-input');
    if (catalogSearch) {
      catalogSearch.addEventListener('input', (e) => {
        catalogSearchTerm = e.target.value.trim();
        renderScholarshipCatalog();
      });
    }

    // Catalog Filter Chips
    const catalogChips = document.querySelectorAll('.catalog-filter-chip');
    catalogChips.forEach(chip => {
      chip.addEventListener('click', () => {
        catalogChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        catalogFilterCategory = chip.getAttribute('data-cat') || 'all';
        renderScholarshipCatalog();
      });
    });
  }

  function resetResultsFilters() {
    resultsFilter = 'all';
    document.querySelectorAll('.results-filter-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-filter') === 'all');
    });
    const input = document.getElementById('results-search-input');
    if (input) input.value = '';
    filterAndRenderResultsCards();
  }

  // ==========================================
  // SCHEME DETAILS MODAL
  // ==========================================
  function bindModalEvents() {
    const overlay = document.getElementById('scheme-modal-overlay');
    const closeBtn = document.getElementById('scheme-modal-close');
    const printBtn = document.getElementById('modal-print-btn');

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  }

  async function openSchemeModal(schemeId) {
    const scheme = await window.ScholarAPI.getSchemeById(schemeId);
    if (!scheme) return;

    const overlay = document.getElementById('scheme-modal-overlay');
    if (!overlay) return;

    // Check if student profile was checked
    let matchResult = null;
    if (cachedResults && cachedResults.matches) {
      const found = cachedResults.matches.find(m => m.scheme.id === schemeId);
      if (found) matchResult = found.matchResult;
    }

    // Populate modal headers
    const titleEl = document.getElementById('modal-scheme-title');
    const providerEl = document.getElementById('modal-scheme-provider');
    const aboutEl = document.getElementById('modal-scheme-about');
    const criteriaListEl = document.getElementById('modal-criteria-breakdown');
    const benefitsEl = document.getElementById('modal-scheme-benefits');
    const docsListEl = document.getElementById('modal-scheme-documents');
    const stepsListEl = document.getElementById('modal-scheme-steps');
    const applyBtn = document.getElementById('modal-apply-btn');

    if (titleEl) titleEl.textContent = scheme.name;
    if (providerEl) {
      providerEl.innerHTML = `
        <span>${scheme.provider}</span> • 
        <strong>${scheme.state || 'All India'}</strong> • 
        <span class="demo-tag">Demo Reference</span>
      `;
    }

    if (aboutEl) {
      aboutEl.textContent = scheme.description || 'This scheme provides targeted financial and academic support to qualifying students across recognized institutions.';
    }

    // Criteria breakdown
    if (criteriaListEl) {
      const categories = (scheme.eligibleCategories || []).join(', ');
      const levels = (scheme.eligibleEducationLevels || []).join(', ');
      const incomeStr = scheme.maxIncome ? `₹${Number(scheme.maxIncome).toLocaleString('en-IN')}` : 'No family income bar';

      let matchHtml = '';
      if (matchResult) {
        matchHtml = `
          <div style="background: ${matchResult.status === 'eligible' ? 'var(--success-light)' : 'var(--warning-light)'}; border: 1px solid ${matchResult.status === 'eligible' ? 'var(--success-border)' : 'var(--warning-border)'}; border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem;">
            <div style="font-weight: 700; color: ${matchResult.status === 'eligible' ? 'var(--success-dark)' : 'var(--warning-dark)'};">
              Your Eligibility Score: ${matchResult.score}% (${matchResult.status.toUpperCase()})
            </div>
            <div style="font-size: 0.82rem; margin-top: 4px; color: var(--text-main);">
              ${matchResult.matchSummary}
            </div>
          </div>
        `;
      }

      criteriaListEl.innerHTML = `
        ${matchHtml}
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Education Levels</span>
            <span class="spec-val">${levels}</span>
          </div>
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Minimum Marks / Percentage</span>
            <span class="spec-val">${scheme.minPercentage}% Aggregate</span>
          </div>
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Annual Family Income Ceiling</span>
            <span class="spec-val">${incomeStr}</span>
          </div>
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Eligible Social Categories</span>
            <span class="spec-val">${categories}</span>
          </div>
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Domicile Requirement</span>
            <span class="spec-val">${scheme.state || 'All India'}</span>
          </div>
          <div class="spec-item" style="background: var(--bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span class="spec-label">Gender Eligibility</span>
            <span class="spec-val">${scheme.genderEligibility || 'All'}</span>
          </div>
        </div>
      `;
    }

    if (benefitsEl) {
      benefitsEl.innerHTML = `
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-md); padding: 1rem 1.25rem;">
          <div style="font-size: 1.15rem; font-weight: 800; color: #1e40af; margin-bottom: 0.25rem;">
            Estimated Benefit: ₹${Number(scheme.benefitAmount || 25000).toLocaleString('en-IN')} / year
          </div>
          <p style="color: #1e3a8a; font-size: 0.92rem;">${scheme.benefits}</p>
        </div>
      `;
    }

    // Required Documents Checklist style
    if (docsListEl) {
      const docs = scheme.requiredDocuments || [
        'Annual Family Income Certificate',
        'Caste / Community Certificate',
        'Previous Marks Cards / Semester Grade Sheets',
        'Aadhaar Card Linked Bank Account Passbook',
        'College Bonafide / Fee Receipt'
      ];
      docsListEl.innerHTML = docs.map(doc => `
        <li>
          <span class="chk-icon">☑</span>
          <span>${doc}</span>
        </li>
      `).join('');
    }

    // Application Process numbered steps
    if (stepsListEl) {
      const steps = scheme.applicationProcess || [
        'Visit the designated official scholarship portal.',
        'Create and authenticate your student profile with Aadhaar.',
        'Fill in educational, bank, and family credentials.',
        'Upload scanned copies of all required documents in checklist.',
        'Submit the application and note your acknowledgment registration number.'
      ];
      stepsListEl.innerHTML = steps.map(step => `
        <li>${step}</li>
      `).join('');
    }

    if (applyBtn) {
      applyBtn.onclick = () => applyScheme(scheme.id);
    }

    overlay.classList.add('open');
  }

  function applyScheme(schemeId) {
    window.ScholarAPI.getSchemeById(schemeId).then(scheme => {
      const url = scheme && scheme.officialUrl ? scheme.officialUrl : 'https://scholarships.gov.in';
      const promptText = `Official Application Portal Link (Demo Reference):\n\n${url}\n\nNote: ScholarMatch is an informational tool. You will now be redirected to the demo official portal reference.`;
      
      if (confirm(promptText)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // ==========================================
  // BOOKMARK MANAGEMENT
  // ==========================================
  function toggleBookmark(schemeId, event) {
    if (event) {
      event.stopPropagation();
    }

    window.ScholarAPI.getSchemeById(schemeId).then(scheme => {
      if (!scheme) return;
      const res = window.ScholarAPI.toggleBookmark(scheme);
      
      // Update bookmark icon in DOM
      document.querySelectorAll(`.scholarship-card[data-id="${schemeId}"] .btn-bookmark`).forEach(btn => {
        btn.classList.toggle('bookmarked', res.bookmarked);
        btn.innerHTML = res.bookmarked ? '❤️' : '🤍';
        btn.title = res.bookmarked ? 'Remove Bookmark' : 'Save Scholarship';
      });

      updateNavBookmarkBadge();
      showToast(res.bookmarked ? `Saved "${scheme.name}" to your dashboard.` : `Removed from saved scholarships.`, 'success');
    });
  }

  function updateNavBookmarkBadge() {
    const badges = document.querySelectorAll('.nav-bookmark-count');
    const bookmarks = window.ScholarAPI.getBookmarks();
    badges.forEach(b => {
      b.textContent = bookmarks.length;
    });
  }

  // ==========================================
  // CONTACT FORM
  // ==========================================
  function bindContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name');
      const email = document.getElementById('contact-email');
      const message = document.getElementById('contact-message');
      const subject = document.getElementById('contact-subject');

      if (!name || !name.value.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }

      if (!email || !email.value.trim() || !email.value.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      if (!message || !message.value.trim()) {
        showToast('Please type your inquiry message.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await window.ScholarAPI.submitContactMessage({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject ? subject.value : 'General Query',
          message: message.value.trim()
        });

        form.reset();
        showToast(`Thank you, ${res.ticketId ? `ticket #${res.ticketId}` : ''} created! We will assist you shortly.`, 'success');
      } catch (err) {
        showToast('Could not submit query. Please try again.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  return {
    init,
    navigateTo,
    renderResults,
    filterAndRenderResultsCards,
    resetResultsFilters,
    renderScholarshipCatalog,
    openSchemeModal,
    applyScheme,
    toggleBookmark,
    updateNavBookmarkBadge,
    showToast
  };
}));
