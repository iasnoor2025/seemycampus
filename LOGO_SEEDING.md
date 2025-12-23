# College Logo Seeding Guide

This guide explains how to automatically find and seed college logos from the web.

## Overview

The logo seeding system uses multiple strategies to find college logos:
1. **Known Logos Database** - Pre-configured logo URLs
2. **Website Direct Search** - Checks common logo paths on college websites
3. **Google Custom Search** - Uses Google Image Search API (optional)
4. **DuckDuckGo API** - Free image search (no API key needed)
5. **Wikipedia API** - Finds logos from Wikipedia pages

## Setup

### Basic Setup (No API Keys Required)

The script works without any API keys using:
- Website direct logo path checking
- DuckDuckGo search
- Wikipedia API

### Optional: Google Custom Search API

For better results, you can optionally set up Google Custom Search:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Custom Search API"
4. Create credentials (API Key)
5. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
6. Create a new search engine
7. Get your Search Engine ID (CX)

Add to your `.env` file:
```env
GOOGLE_CSE_API_KEY=your_api_key_here
GOOGLE_CSE_ID=your_search_engine_id_here
```

## Usage

### Run Logo Seeding

```bash
npm run db:seed:logos
```

This will:
1. Fetch all colleges from the database
2. Skip colleges that already have logo URLs
3. Search for logos using multiple strategies
4. Update the database with found logo URLs
5. Show a summary of results

### What It Does

- **Checks existing logos**: Skips colleges that already have valid logo URLs
- **Searches for logos**: Uses multiple web search strategies
- **Updates database**: Saves found logo URLs to the `images` field
- **Rate limiting**: Adds delays between requests to avoid rate limits

## Manual Logo Addition

You can manually add logo URLs to the `knownLogos` object in `src/db/seed-logos.ts`:

```typescript
const knownLogos: Record<string, string> = {
  "college-slug": "https://example.com/logo.png",
  // Add more here
}
```

## Logo Search Strategies

### 1. Website Direct Search
Checks common logo paths on the college's website:
- `/logo.png`
- `/logo.jpg`
- `/images/logo.png`
- `/assets/logo.png`
- And more...

### 2. Google Custom Search (Optional)
Searches Google Images for the college logo, prioritizing results from the college's own website.

### 3. DuckDuckGo Search
Uses DuckDuckGo's free API to search for logos (no API key needed).

### 4. Wikipedia
Fetches logos from Wikipedia pages if available.

## Output Example

```
🔍 Finding and seeding college logos...

📊 Found 43 colleges to process

🔍 Searching logo for: GL Bajaj Institute of Management and Technology
  ✅ Found logo at: https://www.glbitm.org/logo.png
  ✅ Updated: GL Bajaj Institute of Management and Technology
     Logo URL: https://www.glbitm.org/logo.png
     Source: website-direct

🔍 Searching logo for: Jaipuria Institute Of Management
  ✅ Found: https://www.jaipuria.ac.in/logo.png (google-search-own-site, high)
  ✅ Updated: Jaipuria Institute Of Management
     Logo URL: https://www.jaipuria.ac.in/logo.png
     Source: google-search-own-site

✨ Logo seeding completed!
📊 Summary:
   - Colleges updated: 35
   - Colleges skipped: 5
   - Errors/Not found: 3
   - Total processed: 43
```

## Troubleshooting

### No Logos Found

If logos aren't being found:
1. Check if the college has a website URL in the database
2. Manually add the logo URL to `knownLogos` in `seed-logos.ts`
3. Verify the college website is accessible
4. Try using Google Custom Search API for better results

### Rate Limiting

If you encounter rate limiting:
- The script includes delays between requests
- Increase the delay in `find-logos-web.ts` if needed
- Run the script in smaller batches

### Invalid URLs

The script validates URLs before saving. If a URL is invalid:
- Check the website URL in the database
- Manually verify the logo URL
- Add it to `knownLogos` if it's correct

## Best Practices

1. **Run after comprehensive seeding**: Seed logos after you've added all college data
2. **Review results**: Check the summary to see which logos were found
3. **Manual additions**: Add important college logos manually to `knownLogos`
4. **Regular updates**: Re-run periodically to find new logos or updated URLs

## Notes

- Logo URLs are stored as external URLs (not downloaded locally)
- The comparison component will display logos if URLs are valid
- If logos fail to load, the component shows college initials as fallback
- All logo URLs should be HTTPS for security

