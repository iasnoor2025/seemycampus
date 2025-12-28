const https = require('https');
const { JSDOM } = require('jsdom');

// Allow self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyzeSEO(url) {
  console.log(`🔍 Analyzing SEO for: ${url}\n`);
  
  try {
    const html = await fetchPage(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const issues = [];
    const passed = [];
    
    // Check 1: Document title
    const title = document.querySelector('title');
    if (title && title.textContent.trim()) {
      const titleText = title.textContent.trim();
      if (titleText.length < 30 || titleText.length > 60) {
        issues.push({
          check: 'Document Title',
          issue: `Title length is ${titleText.length} characters (should be 30-60)`,
          value: titleText
        });
      } else {
        passed.push('Document Title');
      }
    } else {
      issues.push({
        check: 'Document Title',
        issue: 'Missing or empty <title> element'
      });
    }
    
    // Check 2: Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.getAttribute('content')) {
      const desc = metaDesc.getAttribute('content').trim();
      if (desc.length < 120 || desc.length > 160) {
        issues.push({
          check: 'Meta Description',
          issue: `Description length is ${desc.length} characters (should be 120-160)`,
          value: desc.substring(0, 100) + '...'
        });
      } else {
        passed.push('Meta Description');
      }
    } else {
      issues.push({
        check: 'Meta Description',
        issue: 'Missing or empty meta description'
      });
    }
    
    // Check 3: H1 tag
    const h1 = document.querySelector('h1');
    if (!h1 || !h1.textContent.trim()) {
      issues.push({
        check: 'H1 Heading',
        issue: 'Missing or empty <h1> element'
      });
    } else {
      passed.push('H1 Heading');
    }
    
    // Check 4: Images with alt attributes
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        check: 'Image Alt Attributes',
        issue: `${imagesWithoutAlt.length} image(s) missing alt attributes`
      });
    } else if (images.length > 0) {
      passed.push('Image Alt Attributes');
    }
    
    // Check 5: Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical || !canonical.getAttribute('href')) {
      issues.push({
        check: 'Canonical URL',
        issue: 'Missing canonical link'
      });
    } else {
      passed.push('Canonical URL');
    }
    
    // Check 6: Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogTitle || !ogDesc) {
      issues.push({
        check: 'Open Graph Tags',
        issue: 'Missing Open Graph title or description'
      });
    } else {
      passed.push('Open Graph Tags');
    }
    
    // Check 7: Favicon
    const favicon = document.querySelector('link[rel="icon"]') || 
                   document.querySelector('link[rel="shortcut icon"]');
    if (!favicon) {
      issues.push({
        check: 'Favicon',
        issue: 'Missing favicon link'
      });
    } else {
      passed.push('Favicon');
    }
    
    // Check 8: Robots meta
    const robots = document.querySelector('meta[name="robots"]');
    if (robots && robots.getAttribute('content') && 
        robots.getAttribute('content').toLowerCase().includes('noindex')) {
      issues.push({
        check: 'Robots Meta',
        issue: 'Page is set to noindex - will not appear in search results'
      });
    } else {
      passed.push('Robots Meta');
    }
    
    // Check 9: Structured Data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      issues.push({
        check: 'Structured Data',
        issue: 'No structured data (JSON-LD) found'
      });
    } else {
      passed.push('Structured Data');
    }
    
    // Display results
    console.log('═══════════════════════════════════════════════════');
    const score = Math.round((passed.length / (passed.length + issues.length)) * 100);
    console.log(`📊 SEO Score: ${score}/100`);
    console.log('═══════════════════════════════════════════════════\n');
    
    if (issues.length > 0) {
      console.log('❌ Issues Found:\n');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.check}`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.value) {
          console.log(`   Current: ${issue.value}`);
        }
        console.log('');
      });
    }
    
    if (passed.length > 0) {
      console.log(`✅ Passed Checks: ${passed.length}\n`);
      passed.forEach(check => console.log(`   ✓ ${check}`));
    }
    
    return { score, issues, passed };
    
  } catch (error) {
    console.error('❌ Error analyzing page:', error.message);
    throw error;
  }
}

const url = process.argv[2] || 'https://seemycampuse.snd-ksa.online/';
analyzeSEO(url)
  .then(result => {
    console.log(`\n✨ Analysis complete!`);
    process.exit(result.issues.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Failed to analyze:', error);
    process.exit(1);
  });

