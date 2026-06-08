const https = require('https');
https.get('https://gymtracker-smoky.vercel.app/', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // find index-<hash>.js
    const match = data.match(/src="(\/assets\/index-.*?\.js)"/);
    if(match) {
      console.log('Found JS file:', match[1]);
      https.get('https://gymtracker-smoky.vercel.app' + match[1], (res2) => {
        let js = '';
        res2.on('data', c => js += c);
        res2.on('end', () => {
          if (js.includes('onrender.com')) {
            console.log('Render URL found in JS bundle');
          } else if (js.includes('localhost:5005')) {
            console.log('localhost:5005 found in JS bundle - Redeploy needed');
          } else {
            console.log('Could not find API URL in JS bundle');
          }
        });
      });
    } else {
      console.log('Script tag not found in HTML:', data.substring(0, 500));
    }
  });
});
