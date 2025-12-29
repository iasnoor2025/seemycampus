# External Reviews Integration Guide

This guide explains how to set up and use the external reviews feature that fetches reviews from Google Maps, college websites, and other sources.

## Overview

The external reviews feature allows you to automatically sync reviews from:
- **Google Maps/Places API** - Reviews from Google Maps listings
- **College Websites** - Reviews scraped from college websites
- **Internet Sources** - Placeholder for future integrations

## Setup

### 1. Database Migration

The schema has been updated to support external reviews. Run the migration:

```bash
npm run db:migrate
```

### 2. Google Maps API Setup (Optional but Recommended)

To fetch reviews from Google Maps, you need:

1. **Get a Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Places API" (New) or "Places API" (Legacy)
   - Create credentials (API Key)
   - Restrict the API key to Places API for security

2. **Add API Key to Environment Variables**
   ```env
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Add Google Place ID to Colleges**
   - Find the Google Place ID for each college:
     - Search for the college on Google Maps
     - Click on the college listing
     - The Place ID is in the URL or you can use the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
   - Update the college record with the `googlePlaceId` field

### 3. College Website Setup

The system automatically attempts to scrape reviews from college websites if:
- The college has a `website` field populated
- The website contains review data in structured format (JSON-LD) or common review patterns

No additional setup required - it works automatically!

## Usage

### Syncing External Reviews

#### Via UI (Recommended)

1. Navigate to any college detail page
2. Scroll to the "Reviews & Ratings" section
3. Click the **"Sync External Reviews"** button
4. The system will:
   - Fetch reviews from Google Maps (if Place ID is set)
   - Scrape reviews from the college website (if available)
   - Add new reviews to the database (avoiding duplicates)
   - Auto-approve external reviews

#### Via API

```bash
POST /api/colleges/[slug]/reviews/sync-external
```

Example:
```bash
curl -X POST http://localhost:3000/api/colleges/iit-delhi/reviews/sync-external
```

Response:
```json
{
  "message": "Synced 15 external reviews",
  "synced": 15,
  "total": 15,
  "reviews": [...]
}
```

### Checking Sync Status

```bash
GET /api/colleges/[slug]/reviews/sync-external
```

Response:
```json
{
  "collegeName": "IIT Delhi",
  "googlePlaceId": "ChIJ...",
  "website": "https://www.iitd.ac.in",
  "externalReviewsCount": 15,
  "hasGooglePlaceId": true,
  "hasWebsite": true
}
```

## How It Works

### Google Maps Reviews

1. Uses Google Places API (New) with fallback to Legacy API
2. Fetches reviews including:
   - Rating (1-5 stars)
   - Review text
   - Reviewer name
   - Review date
   - Link to original review

### College Website Reviews

1. Fetches the college website HTML
2. Parses structured data (JSON-LD) for reviews
3. Searches for common review patterns in HTML
4. Extracts review data including ratings and text

### Deduplication

- External reviews are identified by `externalId`
- Duplicate reviews are automatically skipped
- Each source has a unique ID format:
  - Google Maps: `google_{timestamp}_{reviewer}`
  - College Website: `website_{date}_{author}`

## Display

External reviews are displayed in the Reviews & Ratings section with:
- **Source Badge**: Shows where the review came from (Google Maps, College Website, etc.)
- **Original Date**: Shows the date from the external source
- **View Original Link**: Direct link to the original review (if available)

## Admin Features

- External reviews are **auto-approved** (no manual approval needed)
- External reviews are **auto-verified** (marked as verified)
- All reviews (internal + external) are shown together
- Reviews are sorted by date (external date if available, otherwise created date)

## Troubleshooting

### No Google Maps Reviews

1. Check if `GOOGLE_MAPS_API_KEY` is set in environment variables
2. Verify the Google Place ID is correct for the college
3. Check API quota/limits in Google Cloud Console
4. Ensure Places API is enabled in your Google Cloud project

### No College Website Reviews

1. Verify the college has a `website` field populated
2. Check if the website is accessible (not blocked by robots.txt)
3. Some websites may not have reviews in a parseable format
4. Check browser console for CORS or fetch errors

### Rate Limiting

- Google Maps API has rate limits based on your plan
- College website scraping should be done responsibly
- Consider implementing caching to avoid repeated requests

## Future Enhancements

Potential improvements:
- [ ] Integration with Indian education review sites (Shiksha, CollegeDunia)
- [ ] Scheduled automatic syncing (cron jobs)
- [ ] Review sentiment analysis
- [ ] Review moderation tools
- [ ] Bulk sync for all colleges
- [ ] Review analytics dashboard

## Security & Legal Considerations

- **Respect robots.txt**: The scraper should check robots.txt before scraping
- **Rate Limiting**: Implement delays between requests
- **Terms of Service**: Ensure compliance with Google Maps API ToS and website ToS
- **Data Privacy**: External reviews may contain personal information - handle according to privacy policies
- **CORS**: Some websites may block cross-origin requests - may need server-side proxy

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify API keys and credentials
3. Test API endpoints directly
4. Review the code in `src/lib/reviews/externalReviews.ts`

