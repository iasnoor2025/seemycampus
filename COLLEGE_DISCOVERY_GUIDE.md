# Comprehensive College Discovery Guide

## Overview

This guide explains how to use AI (Ollama) to discover and add colleges to the database. India has over **3,300 colleges and universities**, and this system helps you systematically discover and add them.

## Current Status

- **Current Database**: ~501 colleges (with some duplicates)
- **Target**: 3,300+ colleges across India
- **Method**: AI-powered discovery using Ollama

## Discovery Methods

### 1. Comprehensive Discovery (Recommended)

Discovers colleges across **all 28 states + 8 union territories** and **20 major cities**.

**Via Script:**
```bash
npm run db:discover:comprehensive
```

**Via API (Admin only):**
```bash
POST /api/admin/discover-colleges
{
  "comprehensive": true
}
```

**What it does:**
- Discovers colleges in all 36 states/UTs
- Discovers colleges in 20 major cities
- Removes duplicates automatically
- Processes ~100 colleges per state
- Takes several hours to complete

### 2. State-Specific Discovery

Discover colleges in a specific state:

**Via Script:**
```typescript
// Edit script to call:
discoverAndAddMissingColleges("Karnataka")
```

**Via API:**
```bash
POST /api/admin/discover-colleges
{
  "state": "Karnataka"
}
```

### 3. City-Specific Discovery

Discover colleges in a specific city:

**Via API:**
```bash
POST /api/admin/discover-colleges
{
  "city": "Bangalore"
}
```

### 4. Full Process (Discovery + Enrichment)

Discovers colleges, removes duplicates, and enriches data:

**Via API:**
```bash
POST /api/admin/discover-colleges
{
  "fullProcess": true,
  "state": "Karnataka" // optional
}
```

## How It Works

1. **AI Discovery**: Uses Ollama to query knowledge about Indian colleges
2. **Batch Processing**: Processes colleges in batches (50-100 per request)
3. **Duplicate Detection**: Automatically skips colleges that already exist
4. **Data Enrichment**: Can optionally enrich discovered colleges with detailed data

## Discovery Coverage

### States Covered (28)
- Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh
- Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand
- Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur
- Meghalaya, Mizoram, Nagaland, Odisha, Punjab
- Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura
- Uttar Pradesh, Uttarakhand, West Bengal

### Union Territories Covered (8)
- Andaman and Nicobar Islands, Chandigarh
- Dadra and Nagar Haveli and Daman and Diu
- Delhi, Jammu and Kashmir, Ladakh
- Lakshadweep, Puducherry

### Major Cities Covered (20)
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Surat
- Lucknow, Kanpur, Nagpur, Indore, Thane
- Bhopal, Visakhapatnam, Patna, Vadodara, Ghaziabad

## College Types Discovered

- **Engineering**: IITs, NITs, state engineering colleges, private engineering colleges
- **Management**: IIMs, B-schools, private management institutes
- **Medical**: AIIMS, state medical colleges, private medical colleges
- **Law**: NLUs, state law colleges, private law colleges
- **Arts/Science/Commerce**: Degree colleges, autonomous colleges
- **Universities**: Central, state, private, deemed universities
- **Specialized**: Pharmacy, architecture, design, agriculture, veterinary

## Prerequisites

1. **Ollama Setup**: Ensure `AI_PROVIDER=ollama` in `.env`
2. **Database Access**: Database connection configured
3. **Admin Access**: For API endpoints, admin role required

## Usage Examples

### Example 1: Discover All Colleges

```bash
# Run comprehensive discovery
npm run db:discover:comprehensive

# This will:
# - Discover colleges across all states
# - Remove duplicates
# - Show progress and summary
```

### Example 2: Discover Colleges in Karnataka

```bash
# Via API
curl -X POST http://localhost:3000/api/admin/discover-colleges \
  -H "Content-Type: application/json" \
  -d '{"state": "Karnataka"}'
```

### Example 3: Discover and Enrich

```bash
# Via API - full process
curl -X POST http://localhost:3000/api/admin/discover-colleges \
  -H "Content-Type: application/json" \
  -d '{"fullProcess": true, "state": "Maharashtra"}'
```

## Expected Results

After comprehensive discovery, you should have:
- **2,000-3,000+ colleges** in the database
- Colleges from all major states and cities
- Duplicates removed
- Basic information (name, location, type) for all colleges

After enrichment, each college will have:
- ✅ Complete basic data (description, ranking, contact info)
- ✅ Images (logos and campus photos)
- ✅ Courses offered
- ✅ Student reviews
- ✅ **Cutoff data** (entrance exam ranks/scores)
- ✅ **Placement statistics** (packages, recruiters)
- ✅ **Application guides** (step-by-step instructions)

## Next Steps After Discovery

1. **Remove Duplicates** (if not done automatically):
   ```bash
   npm run db:remove-duplicates
   ```

2. **Enrich College Data** (Recommended):
   ```bash
   npm run db:enrich:ollama
   ```
   
   This will automatically add:
   - ✅ **Basic Data**: Description, ranking, accreditation, contact info
   - ✅ **Images**: Logos and campus images
   - ✅ **Courses**: All courses offered by the college
   - ✅ **Reviews**: Student reviews and ratings
   - ✅ **Cutoffs**: Entrance exam cutoff data (JEE, NEET, CAT, etc.)
   - ✅ **Placements**: Placement statistics and package details
   - ✅ **Application Guides**: Step-by-step application instructions

3. **Add Courses** (if not done during enrichment):
   - Courses are automatically discovered during enrichment
   - Or use: `npm run db:seed:comprehensive-courses`

4. **Add Images/Logos** (if not done during enrichment):
   - Logos are automatically discovered during enrichment
   - Or use: `npm run db:seed:logos`

## Troubleshooting

### Issue: Discovery returns few colleges

**Solution**: Increase `batchSize` parameter (default: 50, try 100-150)

### Issue: Duplicate colleges appearing

**Solution**: Run duplicate removal:
```bash
npm run db:remove-duplicates
```

### Issue: Ollama timeout

**Solution**: 
- Reduce batch size
- Add delays between requests
- Process states one at a time

### Issue: Missing college types

**Solution**: 
- Run discovery multiple times with different prompts
- Use state-specific discovery for better coverage
- Manually add missing colleges via dashboard

## Performance Notes

- **Comprehensive Discovery**: Takes 3-6 hours (due to rate limiting)
- **State Discovery**: Takes 5-10 minutes per state
- **City Discovery**: Takes 2-5 minutes per city
- **Rate Limiting**: Built-in delays prevent overwhelming Ollama

## Monitoring Progress

Check server logs for:
- `✅ Added: [College Name]` - New college added
- `⏭️ Skipped: [College Name]` - College already exists
- `📊 Summary` - Final statistics

## Best Practices

1. **Start with Comprehensive Discovery**: Get broad coverage first
2. **Remove Duplicates**: Run after each major discovery batch
3. **Enrich in Batches**: Don't enrich all colleges at once
4. **Monitor Logs**: Watch for errors or issues
5. **Backup Database**: Before running large discovery operations

## API Reference

### POST /api/admin/discover-colleges

**Request Body:**
```typescript
{
  state?: string,           // Optional: State name
  city?: string,            // Optional: City name
  fullProcess?: boolean,     // Optional: Run full discovery+enrichment
  comprehensive?: boolean    // Optional: Discover across all states
}
```

**Response:**
```typescript
{
  success: true,
  message: "Discovery started in background..."
}
```

## Related Scripts

- `npm run db:discover:comprehensive` - Comprehensive discovery
- `npm run db:remove-duplicates` - Remove duplicate colleges
- `npm run db:enrich:ollama` - Enrich college data (includes cutoffs, placements, guides)
- `npm run db:seed:comprehensive-courses` - Add courses

## Enrichment Features

The enrichment process (`npm run db:enrich:ollama`) automatically adds:

### 1. Cutoffs Data
- Entrance exam cutoff ranks/scores
- Multiple exams (JEE, NEET, CAT, GMAT, etc.)
- Multiple categories (General, OBC, SC, ST, EWS)
- Recent years (2022-2024)
- Course-specific cutoffs

### 2. Placement Statistics
- Placement percentage
- Average, median, highest, lowest packages
- Top recruiting companies
- Department-wise placement data
- Recent years (2022-2024)

### 3. Application Guides
- Step-by-step application process
- Required documents list
- Application fee information
- Important deadlines
- Form filling tips
- Contact information

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify Ollama is running and accessible
3. Ensure database connection is working
4. Check admin authentication for API endpoints

