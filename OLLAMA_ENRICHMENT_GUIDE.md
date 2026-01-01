# Ollama Data Enrichment Guide

This guide explains how to use Ollama AI to automatically enrich college and course data in your database.

## Overview

The Ollama enrichment system automatically fills in missing data for colleges and courses using AI, including:
- Missing college information (description, ranking, fees, etc.)
- College logos (only if not already present)
- Campus images
- Missing courses for colleges

## SEO Safety

**This script is SEO-safe** because it:
- ✅ Only updates MISSING fields - never overwrites existing data
- ✅ Never changes slugs (critical for SEO URLs)
- ✅ Never removes existing data
- ✅ Preserves all existing URLs and paths
- ✅ Only adds new data, never modifies existing content

## Prerequisites

1. **Ollama must be installed and running**
   ```bash
   # Check if Ollama is running
   ollama list
   
   # If not installed, download from https://ollama.com
   ```

2. **Ollama model must be available**
   ```bash
   # Pull the model if not already installed
   ollama pull llama3.2:latest
   ```

3. **Environment variables** (in `.env`):
   ```env
   AI_PROVIDER=ollama
   OLLAMA_API_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2:latest
   DATABASE_URL=your_database_url
   ```

## Usage

### Run Complete Enrichment

```bash
npm run db:enrich:ollama
```

This will:
1. Check all colleges for missing data
2. Use Ollama to find and fill missing information
3. Add logos (only if college doesn't have one)
4. Add campus images
5. Add courses (if college has none, or add new courses if more are found online)

### What Gets Enriched

#### College Data Fields
- Description
- Ranking (NIRF ranking)
- Established Year
- Accreditation (AICTE, UGC, etc.)
- Hostel Fees
- Average Package
- Highest Package
- Entrance Exams
- Ownership (Private/Government)
- Campus Size
- Total Students
- Website
- Email
- Phone

#### Images
- **Logo**: Official college logo (only added if not present)
- **Campus Images**: 3-5 images of campus buildings, facilities, infrastructure

#### Courses
- If college has no courses: Finds and adds all available courses
- If college has some courses: Searches for additional courses and adds any new ones found
- Includes course name, duration, fees, level, study mode
- Automatically skips duplicate courses (by name comparison)

## Process Flow

1. **Data Enrichment**: For each college, checks missing fields and uses Ollama to fill them
2. **Image Enrichment**: 
   - If logo exists: Skips logo, may add campus images if needed
   - If no logo: Finds logo and campus images
3. **Course Enrichment**: Adds courses if college has none, or adds new courses if more are found online

## Rate Limiting

The script includes delays between requests to avoid overwhelming Ollama:
- 2 seconds between data enrichment requests
- 2 seconds between image requests
- 1 second between course requests
- 1 second between colleges

## Output

The script provides detailed console output:
```
[1/100] Processing: IIT Delhi
  📝 Missing fields: description, ranking, establishedYear
  🤖 Enriching with Ollama...
  ✅ Enriched 3 fields
  🖼️  Finding logo and campus images with Ollama...
    ✅ Found logo: https://...
    ✅ Found campus image: https://...
  ✅ Updated with 4 new image(s)
  📚 Finding courses with Ollama (college has none)...
    ✅ Added course: Bachelor of Technology in Computer Science
  ✅ Added 8 new course(s)
  
  OR (if college already has courses):
  📚 College has 5 courses, searching for additional courses...
    ✅ Added course: Master of Science in Data Science
  ✅ Added 3 new course(s), skipped 2 duplicate(s)
```

## Error Handling

- If Ollama is not running, the script will fail with a clear error message
- If a model is not found, it will suggest pulling the model
- Invalid data is skipped (won't break the process)
- Image URLs are verified before adding
- Duplicate courses are automatically skipped

## Best Practices

1. **Run during off-peak hours** - The process can take time for large databases
2. **Monitor the output** - Check for any errors or warnings
3. **Backup database first** - Always good practice before bulk updates
4. **Run incrementally** - You can stop and restart; it will skip already-enriched data

## Troubleshooting

### Ollama Connection Error
```
Error: Cannot connect to Ollama. Please make sure Ollama is running on http://localhost:11434
```
**Solution**: Start Ollama service or check if it's running on a different port

### Model Not Found
```
Error: Ollama model not found. Please make sure the model is installed: ollama pull llama3.2:latest
```
**Solution**: Run `ollama pull llama3.2:latest` or change `OLLAMA_MODEL` in `.env`

### Slow Performance
- The script includes delays to avoid rate limiting
- For faster processing, you can reduce delays (not recommended)
- Consider running on a subset of colleges first

## Limitations

- Ollama responses depend on the model's training data
- Some information may not be 100% accurate (always verify critical data)
- Image URLs may become invalid over time (they're stored as URLs, not downloaded)
- The process is sequential (one college at a time) for reliability

## Future Enhancements

Potential improvements:
- Batch processing for faster enrichment
- Download and store images locally
- Web search integration for more accurate data
- Admin UI to trigger enrichment for specific colleges
- Progress tracking and resume capability

