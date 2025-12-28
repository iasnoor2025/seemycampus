const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function followRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) {
      return reject(new Error('Too many redirects'));
    }
    
    https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).href;
        console.log(`Following redirect: ${res.statusCode} -> ${redirectUrl}`);
        return followRedirect(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Final URL:', url);
        console.log('Response Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('\nHTML Head Section:');
        const headMatch = data.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        if (headMatch) {
          console.log(headMatch[1]);
        } else {
          console.log('No <head> tag found');
          console.log('\nFirst 2000 chars:', data.substring(0, 2000));
        }
        resolve({ url, statusCode: res.statusCode, html: data });
      });
    }).on('error', reject);
  });
}

followRedirect('https://seemycampuse.snd-ksa.online/')
  .then(result => {
    console.log('\n✅ Successfully fetched page');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });

