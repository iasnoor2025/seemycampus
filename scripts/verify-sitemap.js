/**
 * Simple script to verify sitemap is accessible and valid
 * Run: node scripts/verify-sitemap.js
 */

const https = require('https');
const http = require('http');

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seemycampus.com';
const sitemapUrl = `${baseUrl}/sitemap.xml`;

console.log('🔍 Verifying Sitemap...\n');
console.log(`URL: ${sitemapUrl}\n`);

const protocol = sitemapUrl.startsWith('https') ? https : http;

protocol.get(sitemapUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Sitemap is accessible!\n');
      
      // Basic validation
      if (data.includes('<?xml')) {
        console.log('✅ Valid XML format\n');
      } else {
        console.log('⚠️  Warning: May not be valid XML\n');
      }

      // Count URLs
      const urlMatches = data.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;
      console.log(`📊 Found ${urlCount} URLs in sitemap\n`);

      // Check for common pages
      const checks = [
        { name: 'Homepage', pattern: /<loc>https?:\/\/[^<]*\/<\/loc>/ },
        { name: 'Colleges page', pattern: /<loc>https?:\/\/[^<]*\/colleges<\/loc>/ },
        { name: 'College detail pages', pattern: /<loc>https?:\/\/[^<]*\/colleges\/[^<]+<\/loc>/ },
        { name: 'Course pages', pattern: /<loc>https?:\/\/[^<]*\/courses\/[^<]+<\/loc>/ },
      ];

      console.log('📋 Page Type Checks:');
      checks.forEach(check => {
        const found = check.pattern.test(data);
        console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
      });

      console.log('\n✨ Sitemap verification complete!');
      console.log('\nNext steps:');
      console.log('1. Submit this sitemap to Google Search Console');
      console.log('2. URL to submit: sitemap.xml');
      console.log('3. Wait 24-48 hours for processing');
      
    } else {
      console.log(`❌ Error: HTTP ${res.statusCode}`);
      console.log('   Sitemap may not be accessible or deployed yet.');
    }
  });

}).on('error', (err) => {
  console.log(`❌ Error accessing sitemap: ${err.message}`);
  console.log('\nPossible issues:');
  console.log('1. Site may not be deployed yet');
  console.log('2. URL may be incorrect');
  console.log('3. Network connectivity issues');
  console.log('\nVerify manually by visiting:', sitemapUrl);
});

