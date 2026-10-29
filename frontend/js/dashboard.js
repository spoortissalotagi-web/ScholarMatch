/**
 * ScholarMatch - Student Dashboard Controller
 * Manages user profile overview, saved/bookmarked schemes, and application reminders.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StudentDashboard = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function init() {
    bindTabs();
    renderDashboard();
  }

  function bindTabs() {
    const tabBtns = document.querySelectorAll('.dash-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.dash-tab-pane').forEach(pane => {
          pane.classList.toggle('active', pane.id === `dash-pane-${targetTab}`);
        });

        if (targetTab === 'saved') {
          renderSavedBookmarks();
        } else if (targetTab === 'reminders') {
          renderReminders();
        }
      });
    });

    const btnEditProfile = document.getElementById('btn-edit-profile-checker');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        if (window.App && window.App.navigateTo) {
          window.App.navigateTo('checker');
        }
      });
    }
  }

  function renderDashboard() {
    renderProfileSnapshot();
    renderSavedBookmarks();
    renderReminders();
  }

  function renderProfileSnapshot() {
    const profile = window.ScholarAPI.getLastProfile();
    const results = window.ScholarAPI.getLastResults();

    const nameEl = document.getElementById('dash-profile-name');
    const subtitleEl = document.getElementById('dash-profile-subtitle');
    const containerEl = document.getElementById('dash-profile-stats-grid');
    const matchBannerEl = document.getElementById('dash-profile-match-banner');

    if (!profile) {
      if (nameEl) nameEl.textContent = 'Welcome, Guest Scholar';
      if (subtitleEl) subtitleEl.textContent = 'You have not checked your eligibility yet. Fill the eligibility form to discover your matches.';
      if (containerEl) {
        containerEl.innerHTML = `
          <div style="grid-column: span 3; text-align: center; padding: 2rem; background: var(--bg); border-radius: var(--radius-md);">
            <p style="color: var(--text-muted); margin-bottom: 1rem;">No eligibility profile saved yet.</p>
            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('checker')">Check My Eligibility Now</button>
          </div>
        `;
      }
      if (matchBannerEl) matchBannerEl.style.display = 'none';
      return;
    }

    if (nameEl) nameEl.textContent = profile.name || 'Student Scholar';
    if (subtitleEl) {
      subtitleEl.textContent = `${profile.educationLevel} | ${profile.course} (${profile.yearOfStudy}) • Domicile: ${profile.state}`;
    }

    if (containerEl) {
      containerEl.innerHTML = `
        <div class="profile-stat-box">
          <div class="lbl">Category & Domicile</div>
          <div class="val">${profile.category} (${profile.state})</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Academic Score</div>
          <div class="val">${profile.percentage}% Aggregate</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Annual Family Income</div>
          <div class="val">₹${Number(profile.income).toLocaleString('en-IN')}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Income Certificate</div>
          <div class="val">${profile.hasIncomeCert ? '✅ Available' : '❌ Not Available'}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Caste Certificate</div>
          <div class="val">${profile.hasCasteCert ? '✅ Available' : '❌ Not Available'}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Aadhaar Bank Seeding</div>
          <div class="val">${profile.hasAadhaarBank ? '✅ Seeded (DBT Ready)' : '⚠️ Pending'}</div>
        </div>
      `;
    }

    if (matchBannerEl && results) {
      matchBannerEl.style.display = 'block';
      matchBannerEl.innerHTML = `
        <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <strong style="color: var(--primary); font-size: 1rem;">Latest Eligibility Check Summary</strong>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
              Evaluated on ${new Date(results.timestamp).toLocaleDateString('en-IN')}: 
              <span style="color: var(--success-dark); font-weight: 700;">${results.eligible} Eligible</span>, 
              <span style="color: var(--warning-dark); font-weight: 700;">${results.potential} Potential Matches</span>.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.navigateTo('results')">View Matched Results</button>
        </div>
      `;
    }
  }

  async function renderSavedBookmarks() {
    const listContainer = document.getElementById('dash-saved-schemes-list');
    if (!listContainer) return;

    const bookmarks = window.ScholarAPI.getBookmarks();
    if (bookmarks.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔖</div>
          <h4 style="font-weight: 700; margin-bottom: 0.4rem;">No Saved Scholarships Yet</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 400px; margin: 0 auto 1.2rem auto;">
            Click the bookmark icon on any scholarship card to save it for fast reference and reminders.
          </p>
          <button class="btn btn-outline-primary btn-sm" onclick="App.navigateTo('scholarships')">Explore Scholarships</button>
        </div>
      `;
      return;
    }

    const allSchemes = await window.ScholarAPI.getAllSchemes();

    listContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
        ${bookmarks.map(bm => {
          const scheme = allSchemes.find(s => s.id === bm.id) || bm;
          return `
            <div style="background: #ffffff; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-sm);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span style="background: #eff6ff; color: var(--primary); font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-sm);">SAVED</span>
                  <button class="btn-bookmark bookmarked" onclick="StudentDashboard.removeBookmark('${bm.id}')" title="Remove bookmark">❤️</button>
                </div>
                <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;">${scheme.name}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">${scheme.provider}</p>
                <div style="font-size: 0.82rem; background: var(--bg); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
                  <div><strong>Annual Benefit:</strong> ₹${Number(scheme.benefitAmount || 25000).toLocaleString('en-IN')}</div>
                  <div><strong>Deadline:</strong> ${scheme.deadline || 'Closing Soon'}</div>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.openSchemeModal('${scheme.id}')">View Details</button>
                <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="App.applyScheme('${scheme.id}')">Apply Link</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async function renderReminders() {
    const remindersContainer = document.getElementById('dash-reminders-list');
    if (!remindersContainer) return;

    const allSchemes = await window.ScholarAPI.getAllSchemes();
    const sortedByDate = [...allSchemes].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    remindersContainer.innerHTML = `
      <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Upcoming Application Deadlines (Academic Year 2026-27)</h4>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${sortedByDate.slice(0, 8).map(s => {
            const daysLeft = Math.ceil((new Date(s.deadline) - new Date('2026-10-29')) / (1000 * 60 * 60 * 24));
            const isUrgent = daysLeft <= 25;
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); flex-wrap: wrap; gap: 0.75rem;">
                <div style="flex: 1; min-width: 260px;">
                  <strong style="font-size: 0.92rem; color: var(--text-main);">${s.name}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${s.provider}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="text-align: right;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: ${isUrgent ? 'var(--danger-dark)' : 'var(--text-main)'};">
                      Deadline: ${s.deadline}
                    </div>
                    <div style="font-size: 0.75rem; color: ${isUrgent ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 600;">
                      ${daysLeft > 0 ? `${daysLeft} days remaining` : 'Closing today'}
                    </div>
                  </div>
                  <button class="btn btn-outline-primary btn-sm" onclick="App.openSchemeModal('${s.id}')">Details</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function removeBookmark(schemeId) {
    window.ScholarAPI.toggleBookmark({ id: schemeId });
    renderSavedBookmarks();
    if (window.App && window.App.updateNavBookmarkBadge) {
      window.App.updateNavBookmarkBadge();
    }
  }

  return {
    init,
    renderDashboard,
    removeBookmark
  };
}));
