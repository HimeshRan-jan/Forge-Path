document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;

  const experimentForm = document.getElementById('experimentForm');
  const experimentsGrid = document.getElementById('experimentsGrid');
  const detailsContainer = document.getElementById('detailsContainer');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');

  const urlParams = new URLSearchParams(window.location.search);
  const experimentId = urlParams.get('id');

  // ═══ FORM HANDLER (Add / Edit) ═══
  if (experimentForm) {
    if (experimentId) {
      const h1 = document.querySelector('h1');
      if (h1) h1.innerText = 'Edit Experiment';
      loadExperimentForEdit(experimentId);
    }

    experimentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const saveBtn = document.getElementById('saveExperimentBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const tagsString = document.getElementById('tags').value;
      const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        title: document.getElementById('title').value.trim(),
        technology: document.getElementById('technology').value.trim(),
        framework: document.getElementById('framework').value.trim(),
        category: document.getElementById('category').value.trim(),
        status: document.getElementById('status').value,
        difficulty: document.getElementById('difficulty').value,
        tags,
        setupDetails: document.getElementById('setupDetails').value.trim(),
        stepsPerformed: document.getElementById('stepsPerformed').value.trim(),
        expectedResult: document.getElementById('expectedResult').value.trim(),
        observedOutcome: document.getElementById('observedOutcome').value.trim(),
        issuesFaced: document.getElementById('issuesFaced').value.trim(),
        solutionNotes: document.getElementById('solutionNotes').value.trim()
      };

      // Basic validation
      if (!payload.title || !payload.technology) {
        showToast('Title and Technology are required', 'error');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = experimentId ? 'Save Changes' : 'Save Experiment'; }
        return;
      }

      try {
        let response;
        if (experimentId) {
          response = await api.put(`/experiments/${experimentId}`, payload);
        } else {
          response = await api.post('/experiments', payload);
        }

        if (response.success) {
          if (experimentId) {
            sessionStorage.setItem('notify_edit_exp', 'true');
          } else {
            sessionStorage.setItem('notify_new_exp', 'true');
          }
          window.location.href = `experiment-details.html?id=${response.data._id}`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = experimentId ? 'Save Changes' : 'Save Experiment'; }
      }
    });
  }

  // ═══ EXPERIMENTS LIST ═══
  if (experimentsGrid) {
    const fetchAndRenderExperiments = async () => {
      let url = '/experiments';
      const params = new URLSearchParams();
      if (searchInput && searchInput.value) params.append('technology', searchInput.value);
      if (statusFilter && statusFilter.value) params.append('status', statusFilter.value);
      if (params.toString()) url += `?${params.toString()}`;

      try {
        const res = await api.get(url);
        if (res.success) {
          if (res.data.length === 0) {
            experimentsGrid.innerHTML = `
              <div class="text-center w-100 py-4" style="grid-column:1/-1">
                <p class="text-secondary">No experiments found.</p>
                <a href="add-experiment.html" class="btn btn-primary mt-4" style="display:inline-flex">Create Your First Experiment</a>
              </div>`;
            return;
          }
          experimentsGrid.innerHTML = res.data.map(exp => `
            <div class="card experiment-card">
              <div>
                <h4>${escapeHtml(exp.title)}</h4>
                <p class="text-sm text-secondary" style="margin-top:0.3rem">${escapeHtml(exp.technology)}${exp.framework ? ' / ' + escapeHtml(exp.framework) : ''}</p>
                <div class="mt-2" style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                  <span class="badge ${getStatusClass(exp.status)}">${escapeHtml(exp.status || 'Draft')}</span>
                  ${exp.difficulty ? `<span class="badge">${escapeHtml(exp.difficulty)}</span>` : ''}
                </div>
                ${exp.tags && exp.tags.length ? `
                  <div style="margin-top:0.75rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
                    ${exp.tags.slice(0, 3).map(t => `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;background:var(--surface-muted);border-radius:var(--radius-full);color:var(--text-tertiary)">${escapeHtml(t)}</span>`).join('')}
                  </div>` : ''}
              </div>
              <div class="mt-4">
                <a href="experiment-details.html?id=${exp._id}" class="btn btn-secondary btn-sm">View Details</a>
              </div>
            </div>
          `).join('');
        }
      } catch (err) {
        experimentsGrid.innerHTML = `<p class="text-secondary">Error loading experiments.</p>`;
      }
    };

    fetchAndRenderExperiments();
    if (searchInput) searchInput.addEventListener('input', debounce(fetchAndRenderExperiments, 400));
    if (statusFilter) statusFilter.addEventListener('change', fetchAndRenderExperiments);
  }

  // ═══ EXPERIMENT DETAILS ═══
  if (detailsContainer && experimentId) {
    const loadDetails = async () => {
      try {
        const res = await api.get(`/experiments/${experimentId}`);
        if (res.success) {
          const exp = res.data;
          detailsContainer.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
              <div>
                <div style="display:flex;gap:0.4rem;margin-bottom:0.75rem;">
                  <span class="badge ${getStatusClass(exp.status)}">${escapeHtml(exp.status || 'Draft')}</span>
                  ${exp.difficulty ? `<span class="badge">${escapeHtml(exp.difficulty)}</span>` : ''}
                  ${exp.category ? `<span class="badge badge-primary">${escapeHtml(exp.category)}</span>` : ''}
                </div>
                <h2 style="margin:0;font-size:1.5rem">${escapeHtml(exp.title)}</h2>
              </div>
            </div>
            
            <div class="meta-info">
              <div class="meta-item"><span class="meta-label">Technology</span><span class="meta-value">${escapeHtml(exp.technology)}</span></div>
              ${exp.framework ? `<div class="meta-item"><span class="meta-label">Framework</span><span class="meta-value">${escapeHtml(exp.framework)}</span></div>` : ''}
              <div class="meta-item"><span class="meta-label">Created</span><span class="meta-value">${new Date(exp.createdAt).toLocaleDateString()}</span></div>
            </div>

            ${exp.tags && exp.tags.length ? `
              <div style="margin-bottom:1.5rem;display:flex;gap:0.35rem;flex-wrap:wrap;">
                ${exp.tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('')}
              </div>` : ''}

            <div class="details-grid">
              ${renderDetailSection('Setup Details', exp.setupDetails)}
              ${renderDetailSection('Steps Performed', exp.stepsPerformed)}
              ${renderDetailSection('Expected Result', exp.expectedResult)}
              ${renderDetailSection('Observed Outcome', exp.observedOutcome)}
              ${renderDetailSection('Issues Faced', exp.issuesFaced)}
              ${renderDetailSection('Solution Notes', exp.solutionNotes)}
            </div>

            <div class="actions-bar">
              <a href="edit-experiment.html?id=${exp._id}" class="btn btn-primary">Edit Experiment</a>
              <button id="deleteBtn" class="btn btn-danger">Delete</button>
              <a href="experiments.html" class="btn btn-secondary">← Back to List</a>
            </div>
          `;

          document.getElementById('deleteBtn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this experiment? This cannot be undone.')) {
              try {
                await api.delete(`/experiments/${exp._id}`);
                showToast('Experiment deleted');
                setTimeout(() => window.location.href = 'experiments.html', 800);
              } catch (err) {
                showToast('Failed to delete', 'error');
              }
            }
          });
        }
      } catch (err) {
        detailsContainer.innerHTML = `<p class="text-secondary">Error loading experiment details. <a href="experiments.html">Go back</a></p>`;
      }
    };
    loadDetails();
  }
});

// ═══ LOAD EXPERIMENT FOR EDIT ═══
async function loadExperimentForEdit(id) {
  try {
    const res = await api.get(`/experiments/${id}`);
    if (res.success) {
      const exp = res.data;
      // Populate ALL fields
      setFieldValue('title', exp.title);
      setFieldValue('technology', exp.technology);
      setFieldValue('framework', exp.framework);
      setFieldValue('category', exp.category);
      setFieldValue('status', exp.status);
      setFieldValue('difficulty', exp.difficulty);
      setFieldValue('tags', exp.tags ? exp.tags.join(', ') : '');
      setFieldValue('setupDetails', exp.setupDetails);
      setFieldValue('stepsPerformed', exp.stepsPerformed);
      setFieldValue('expectedResult', exp.expectedResult);
      setFieldValue('observedOutcome', exp.observedOutcome);
      setFieldValue('issuesFaced', exp.issuesFaced);
      setFieldValue('solutionNotes', exp.solutionNotes);
    }
  } catch (err) {
    showToast('Failed to load experiment data', 'error');
  }
}

// ═══ HELPERS ═══
function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function renderDetailSection(title, content) {
  if (!content) return '';
  return `
    <div class="details-section">
      <h3>${escapeHtml(title)}</h3>
      <p style="color:var(--text-secondary);line-height:1.7;white-space:pre-wrap">${escapeHtml(content)}</p>
    </div>`;
}

function getStatusClass(status) {
  switch (status) {
    case 'Success': return 'badge-success';
    case 'Failed': return 'badge-danger';
    case 'In Progress': return 'badge-primary';
    default: return '';
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
