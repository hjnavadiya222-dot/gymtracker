const fs = require('fs');
const path = require('path');

const dir = 'frontend/src';

const replaceInDir = (d) => {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      replaceInDir(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      if (content.includes("'http://localhost:5005")) {
        // Replace 'http://localhost:5005/api...' with `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api...`
        content = content.replace(/'http:\/\/localhost:5005/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}` + '");
        
        // Fix the string concatenation (e.g. `${...}` + '/api/auth/register')
        // Actually, just using a variable for the base URL is cleaner.
        // But doing a direct replace is fine since all endpoints start with /api
        
        fs.writeFileSync(p, content);
        console.log('Updated ' + p);
      }
    }
  });
};

replaceInDir(dir);
