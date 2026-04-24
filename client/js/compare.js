document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  const exp1Select = document.getElementById('exp1Select');
  const exp2Select = document.getElementById('exp2Select');
  const compareBtn = document.getElementById('compareBtn');
  const comparisonResult = document.getElementById('comparisonResult');
  const col1 = document.getElementById('col1');
  const col2 = document.getElementById('col2');

  // Load experiments for dropdowns
  try {
    const res = await api.get('/experiments');
    if (res.success) {
      const options = res.data.map(exp =>
        `<option value="${exp._id}">${escapeHtml(exp.title)} (${escapeHtml(exp.technology)})</option>`
      ).join('');

      exp1Select.innerHTML += options;
      exp2Select.innerHTML += options;
    }
  } catch (error) {
    showToast('Failed to load experiments', 'error');
  }

  const checkSelection = () => {
    compareBtn.disabled = !(exp1Select.value && exp2Select.value && exp1Select.value !== exp2Select.value);
  };

  exp1Select.addEventListener('change', checkSelection);
  exp2Select.addEventListener('change', checkSelection);

  compareBtn.addEventListener('click', async () => {
    compareBtn.disabled = true;
    compareBtn.textContent = 'Comparing...';

    try {
      const res = await api.get(`/compare?id1=${exp1Select.value}&id2=${exp2Select.value}`);
      if (res.success) {
        const { experiment1, experiment2 } = res.data;

        comparisonResult.style.display = 'block';
        comparisonResult.style.animation = 'fadePageIn 0.4s ease';

        col1.innerHTML = renderCompareCol(experiment1);
        col2.innerHTML = renderCompareCol(experiment2);

        showToast('⚖️ Comparison complete!');
        setTimeout(() => showToast('⭐ Earned +10 XP!', 'success'), 1200);
        setTimeout(() => showToast('🏆 Earned Badge: Analyst!', 'success'), 2500);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      compareBtn.disabled = false;
      compareBtn.textContent = 'Compare Now';
      checkSelection();
    }
  });
});

function renderCompareCol(exp) {
  return `
    <div style="margin-bottom:1.25rem;">
      <h2 style="color:var(--primary-color);font-size:1.2rem;margin-bottom:0.5rem;">${escapeHtml(exp.title)}</h2>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        <span class="badge ${exp.status === 'Success' ? 'badge-success' : exp.status === 'Failed' ? 'badge-danger' : 'badge-primary'}">${escapeHtml(exp.status || 'Draft')}</span>
        ${exp.difficulty ? `<span class="badge">${escapeHtml(exp.difficulty)}</span>` : ''}
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <p class="text-sm text-secondary" style="margin-bottom:0.2rem;font-family:'JetBrains Mono',monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;">Technology</p>
      <p style="font-weight:600;">${escapeHtml(exp.technology)} ${exp.framework ? '/ ' + escapeHtml(exp.framework) : ''}</p>
    </div>

    <div style="margin-bottom:1rem;">
      <p class="text-sm text-secondary" style="margin-bottom:0.2rem;font-family:'JetBrains Mono',monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;">Setup Details</p>
      <p style="color:var(--text-secondary);line-height:1.6;white-space:pre-wrap;">${escapeHtml(exp.setupDetails) || '—'}</p>
    </div>

    <div style="margin-bottom:1rem;">
      <p class="text-sm text-secondary" style="margin-bottom:0.2rem;font-family:'JetBrains Mono',monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;">Observed Outcome</p>
      <p style="color:var(--text-secondary);line-height:1.6;white-space:pre-wrap;">${escapeHtml(exp.observedOutcome) || '—'}</p>
    </div>

    <div>
      <p class="text-sm text-secondary" style="margin-bottom:0.2rem;font-family:'JetBrains Mono',monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;">Issues Faced</p>
      <p style="color:var(--text-secondary);line-height:1.6;white-space:pre-wrap;">${escapeHtml(exp.issuesFaced) || '—'}</p>
    </div>
  `;
}
