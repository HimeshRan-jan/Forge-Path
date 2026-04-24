const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\DELL\\Downloads\\Forge Path v2\\Forge Path\\client';
const pages = ['dashboard', 'experiments', 'add-experiment', 'compare', 'profile', 'about-us', 'manual', 'login', 'signup', 'edit-experiment', 'experiment-details'];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      pages.forEach(page => {
        // Replace href="/page" with href="page.html"
        const hrefRegex = new RegExp(`href=["']\\/(${page})["']`, 'g');
        content = content.replace(hrefRegex, `href="${page}.html"`);
        
        // Replace window.location.href = '/page' (and variations) with 'page.html'
        const regexStr1 = new RegExp(`(location\\.href\\s*=\\s*['"\`])\\/(${page})(['"\`?\\n])`, 'g');
        content = content.replace(regexStr1, `$1${page}.html$3`);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}
processDir(dir);
