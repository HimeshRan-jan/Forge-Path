const fs = require('fs');
const path = require('path');

const files = [
  'about-us.html', 'add-experiment.html', 'compare.html', 'dashboard.html',
  'edit-experiment.html', 'experiment-details.html', 'experiments.html',
  'profile.html', 'manual.html'
];
const newLogo = `      <a href="/dashboard" class="navbar-brand" style="gap:0.6rem;">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <polygon points="16,3 29,16 16,29 3,16" fill="#0f172a" stroke="#1e3a8a" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="16" cy="11" r="2" fill="#f97316"/>
          <path d="M16 23V14M12 18l4-4 4 4" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div style="width:1px;height:22px;background:rgba(255,255,255,0.2);margin:0 0.1rem;"></div>
        <div style="display:flex;flex-direction:column;justify-content:center;line-height:1;">
          <div style="display:flex;align-items:baseline;">
            <span style="color:var(--text-primary);font-weight:800;font-size:1.05rem;letter-spacing:-0.02em;">Forge</span><span style="color:#f97316;font-weight:800;font-size:1.05rem;letter-spacing:-0.02em;">Path</span>
          </div>
          <span style="font-size:0.4rem;color:var(--text-tertiary);letter-spacing:0.12em;font-weight:600;margin-top:0.15rem;text-transform:uppercase;">Forge Your Career Path</span>
        </div>
      </a>`;

const dir = 'c:\\Users\\anshv\\OneDrive\\Desktop\\Forge Path\\client';

for (let file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let replaced = content.replace(
    /      <a href="\/dashboard" class="navbar-brand">[\s\S]*?<\/a>/,
    newLogo
  );
  fs.writeFileSync(path.join(dir, file), replaced);
}

let loginContent = fs.readFileSync(path.join(dir, 'login.html'), 'utf8');
const oldBrandRow = `      <div class="brand-row">
        <div class="brand-icon">⚒</div>
        <div class="brand-wordmark"><span class="forge">FORGE</span><span class="path">PATH</span></div>
      </div>`;
const newLoginLogo = `      <div class="brand-row">
        <svg width="46" height="46" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <polygon points="16,3 29,16 16,29 3,16" fill="#0f172a" stroke="#1e3a8a" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="16" cy="11" r="2" fill="#f97316"/>
          <path d="M16 23V14M12 18l4-4 4 4" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div style="width:1px;height:38px;background:rgba(255,255,255,0.2);margin:0 0.5rem;"></div>
        <div style="display:flex;flex-direction:column;justify-content:center;line-height:1;">
          <div class="brand-wordmark" style="display:flex;align-items:baseline;">
            <span class="forge" style="color:var(--txt);">FORGE</span><span class="path" style="color:#f97316;">PATH</span>
          </div>
          <span style="font-size:0.65rem;color:var(--muted);letter-spacing:0.12em;font-weight:600;margin-top:0.3rem;text-transform:uppercase;font-family:'DM Sans', sans-serif;">Forge Your Career Path</span>
        </div>
      </div>`;

loginContent = loginContent.replace(oldBrandRow, newLoginLogo);
loginContent = loginContent.replace(
  /\.brand-wordmark \.path\s*\{\s*color:\s*#60a5fa\s*\}/,
  '.brand-wordmark .path  { color: #f97316 }'
);
fs.writeFileSync(path.join(dir, 'login.html'), loginContent);
