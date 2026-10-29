/**
 * ScholarMatch - Admin / Scheme Management Controller
 * Handles administrative viewing, editing, adding, and deleting scholarships.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AdminController = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentEditingId = null;

  function init() {
    bindEvents();
    renderSchemesTable();
  }

  function bindEvents() {
    const btnAddNew = document.getElementById('btn-admin-add-scheme');
    const btnResetData = document.getElementById('btn-admin-reset-demo');
    const modalForm = document.getElementById('admin-scheme-form');
    const modalClose = document.getElementById('admin-modal-close');
    const modalCancel = document.getElementById('admin-form-cancel');

    if (btnAddNew) {
      btnAddNew.addEventListener('click', openAddModal);
    }

    if (btnResetData) {
      btnResetData.addEventListener('click', handleResetDemo);
    }

    if (modalForm) {
      modalForm.addEventListener('submit', handleFormSave);
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeAdminModal);
    }

    if (modalCancel) {
      modalCancel.addEventListener('click', closeAdminModal);
    }
  }

  async function renderSchemesTable() {
    const tbody = document.getElementById('admin-schemes-tbody');
    const totalCountEl = document.getElementById('admin-total-schemes-count');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">Loading scheme catalog...</td></tr>`;

    try {
      const schemes = await window.ScholarAPI.getAllSchemes();
      if (totalCountEl) totalCountEl.textContent = schemes.length;

      if (schemes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No schemes found. Click 'Add New Scheme' or 'Reset Demo Data'.</td></tr>`;
        return;
      }

      tbody.innerHTML = schemes.map(s => {
        const categories = (s.eligibleCategories || []).join(', ');
        const levels = (s.eligibleEducationLevels || []).join(', ');
        const incomeFormatted = s.maxIncome ? `₹${Number(s.maxIncome).toLocaleString('en-IN')}` : 'No Limit';

        return `
          <tr>
            <td>
              <strong>${s.name}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${s.provider}</div>
              ${s.isDemo ? '<span class="demo-tag" style="margin-top: 4px; display: inline-block;">Demo Data</span>' : ''}
            </td>
            <td>${s.state || 'All India'}</td>
            <td>${incomeFormatted}</td>
            <td><strong>${s.minPercentage}%</strong></td>
            <td>
              <div style="font-size: 0.8rem;">${categories}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${levels}</div>
            </td>
            <td>
              <div class="admin-actions-cell">
                <button class="btn btn-secondary btn-sm" onclick="AdminController.openEditModal('${s.id}')">Edit</button>
                <button class="btn btn-outline-primary btn-sm" style="color: var(--danger); border-color: var(--danger-border);" onclick="AdminController.deleteScheme('${s.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error rendering schemes table:', e);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--danger);">Error loading data.</td></tr>`;
    }
  }

  function openAddModal() {
    currentEditingId = null;
    const form = document.getElementById('admin-scheme-form');
    if (form) form.reset();

    const title = document.getElementById('admin-modal-title');
    if (title) title.textContent = 'Add New Scholarship Scheme';

    const overlay = document.getElementById('admin-scheme-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  async function openEditModal(schemeId) {
    currentEditingId = schemeId;
    const scheme = await window.ScholarAPI.getSchemeById(schemeId);
    if (!scheme) return;

    const title = document.getElementById('admin-modal-title');
    if (title) title.textContent = `Edit Scheme: ${scheme.name}`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('admin-field-name', scheme.name || '');
    setVal('admin-field-provider', scheme.provider || '');
    setVal('admin-field-state', scheme.state || 'All India');
    setVal('admin-field-max-income', scheme.maxIncome || '');
    setVal('admin-field-min-percentage', scheme.minPercentage || '');
    setVal('admin-field-categories', (scheme.eligibleCategories || []).join(', '));
    setVal('admin-field-education-levels', (scheme.eligibleEducationLevels || []).join(', '));
    setVal('admin-field-benefits', scheme.benefits || '');
    setVal('admin-field-benefit-amount', scheme.benefitAmount || '');
    setVal('admin-field-deadline', scheme.deadline || '');
    setVal('admin-field-official-url', scheme.officialUrl || '');
    setVal('admin-field-description', scheme.description || '');
    setVal('admin-field-required-docs', (scheme.requiredDocuments || []).join('\n'));

    const overlay = document.getElementById('admin-scheme-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  function closeAdminModal() {
    const overlay = document.getElementById('admin-scheme-modal-overlay');
    if (overlay) overlay.classList.remove('open');
    currentEditingId = null;
  }

  async function handleFormSave(e) {
    e.preventDefault();

    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const categories = val('admin-field-categories').split(',').map(s => s.trim()).filter(Boolean);
    const eduLevels = val('admin-field-education-levels').split(',').map(s => s.trim()).filter(Boolean);
    const docs = val('admin-field-required-docs').split('\n').map(s => s.trim()).filter(Boolean);

    const schemeData = {
      name: val('admin-field-name'),
      provider: val('admin-field-provider'),
      state: val('admin-field-state') || 'All India',
      maxIncome: parseFloat(val('admin-field-max-income')) || 0,
      minPercentage: parseFloat(val('admin-field-min-percentage')) || 0,
      eligibleCategories: categories.length ? categories : ['General', 'OBC', 'SC', 'ST'],
      eligibleEducationLevels: eduLevels.length ? eduLevels : ['Undergraduate'],
      eligibleCourses: ['All Courses'],
      genderEligibility: 'All',
      requiresDisability: false,
      requiresIncomeCert: true,
      requiresCasteCert: false,
      requiresDomicileCert: false,
      benefits: val('admin-field-benefits'),
      benefitAmount: parseFloat(val('admin-field-benefit-amount')) || 25000,
      deadline: val('admin-field-deadline') || '2026-12-31',
      officialUrl: val('admin-field-official-url') || 'https://scholarships.gov.in (Demo)',
      description: val('admin-field-description'),
      requiredDocuments: docs.length ? docs : ['Income Certificate', 'Aadhaar Card', 'Marks Card'],
      applicationProcess: [
        'Visit the official scholarship portal.',
        'Register your student profile using Aadhaar/DigiLocker.',
        'Upload verified certificates and marksheets.',
        'Submit the application and note the reference ID.'
      ],
      isDemo: true,
      tags: ['Scholarship', 'Govt Scheme']
    };

    try {
      if (currentEditingId) {
        await window.ScholarAPI.updateScheme(currentEditingId, schemeData);
        window.App.showToast('Scheme updated successfully!', 'success');
      } else {
        await window.ScholarAPI.createScheme(schemeData);
        window.App.showToast('New scholarship scheme added to dataset!', 'success');
      }

      closeAdminModal();
      renderSchemesTable();
    } catch (err) {
      console.error('Error saving scheme:', err);
      window.App.showToast('Failed to save scheme. Please try again.', 'error');
    }
  }

  async function deleteScheme(id) {
    if (!confirm('Are you sure you want to delete this scholarship scheme from the dataset?')) {
      return;
    }

    try {
      await window.ScholarAPI.deleteScheme(id);
      window.App.showToast('Scheme deleted from dataset.', 'success');
      renderSchemesTable();
    } catch (err) {
      console.error('Error deleting scheme:', err);
      window.App.showToast('Failed to delete scheme.', 'error');
    }
  }

  async function handleResetDemo() {
    if (!confirm('Reset dataset back to standard 14 demo schemes? Any custom added schemes will be restored to defaults.')) {
      return;
    }

    try {
      await window.ScholarAPI.resetDefaultSchemes();
      window.App.showToast('Dataset restored to default 14 schemes!', 'success');
      renderSchemesTable();
    } catch (err) {
      console.error('Error resetting schemes:', err);
      window.App.showToast('Failed to reset dataset.', 'error');
    }
  }

  return {
    init,
    renderSchemesTable,
    openAddModal,
    openEditModal,
    closeAdminModal,
    deleteScheme,
    handleResetDemo
  };
}));
