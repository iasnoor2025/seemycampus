const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runAudit(url) {
  console.log(`🔍 Running SEO audit for: ${url}\n`);
  
  // Launch Chrome
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['seo'],
    port: chrome.port,
  };

  try {
    // Run Lighthouse
    const runnerResult = await lighthouse(url, options, null);
    
    // Extract SEO score
    const seoScore = runnerResult.lhr.categories.seo.score * 100;
    const seoAudit = runnerResult.lhr.audits;
    
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 SEO Score: ${seoScore.toFixed(0)}/100`);
    console.log('═══════════════════════════════════════════════════\n');
    
    // Show failed audits
    const failedAudits = Object.values(seoAudit).filter(
      audit => audit.score !== null && audit.score < 1
    );
    
    if (failedAudits.length > 0) {
      console.log('❌ Failed SEO Checks:\n');
      failedAudits.forEach(audit => {
        const score = (audit.score * 100).toFixed(0);
        console.log(`  • ${audit.title}: ${score}%`);
        if (audit.explanation) {
          console.log(`    ${audit.explanation.substring(0, 100)}...`);
        }
      });
      console.log('');
    }
    
    // Show passed audits
    const passedAudits = Object.values(seoAudit).filter(
      audit => audit.score === 1
    );
    
    console.log(`✅ Passed SEO Checks: ${passedAudits.length}\n`);
    
    // Save full report
    const reportPath = path.join(process.cwd(), 'lighthouse-seo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(runnerResult.lhr, null, 2));
    console.log(`📄 Full report saved to: ${reportPath}\n`);
    
    return seoScore;
  } catch (error) {
    console.error('❌ Error running audit:', error);
    throw error;
  } finally {
    await chrome.kill();
  }
}

// Get URL from command line or use default
const url = process.argv[2] || 'http://localhost:3000';

runAudit(url)
  .then(score => {
    console.log(`\n✨ Audit complete! SEO Score: ${score.toFixed(0)}/100`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to run audit:', error);
    process.exit(1);
  });

