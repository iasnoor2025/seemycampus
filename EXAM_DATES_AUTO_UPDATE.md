# Automatic Exam Date Update System

This system automatically updates entrance exam dates when the academic year changes, ensuring your platform always displays current and relevant exam information.

## How It Works

The system:
1. **Detects Academic Year Changes**: Automatically identifies when we move to a new academic year (April 1st in India)
2. **Updates Exam Dates**: Increments all exam dates by 1 year for exams from past academic years
3. **Preserves Date Patterns**: Maintains the same month/day patterns (e.g., CAT always in November)

## Features

- ✅ Automatic detection of academic year changes
- ✅ Smart date incrementing (preserves month/day)
- ✅ Only updates exams from past academic years
- ✅ Can be run manually or via scheduled cron job
- ✅ Safe operation (skips exams that are already current)

## Usage

### Manual Update

Run the update script manually:

```bash
npm run db:update:exam-dates
```

This will:
- Check all active exams
- Identify exams with dates from past academic years
- Update their dates by incrementing by 1 year
- Show a summary of what was updated

### Automatic Update (Cron Job)

The system includes an API endpoint that can be called by cron services:

**Endpoint**: `/api/cron/update-exam-dates`

#### Vercel Cron (Recommended)

If deploying on Vercel, the `vercel.json` file is already configured to run the update on April 1st every year (when the new academic year starts in India).

The cron job is configured as:
```json
{
  "path": "/api/cron/update-exam-dates",
  "schedule": "0 0 1 4 *"  // April 1st at midnight
}
```

#### Other Cron Services

You can use any cron service to call the endpoint:

**Examples:**
- **cron-job.org**: Set up a monthly or yearly job
- **EasyCron**: Schedule to run on April 1st
- **GitHub Actions**: Use scheduled workflows
- **Custom server**: Set up a cron job on your server

**Example curl command:**
```bash
curl -X GET https://your-domain.com/api/cron/update-exam-dates
```

#### Security (Optional)

For production, you may want to add authentication. Uncomment the authentication check in `/api/cron/update-exam-dates/route.ts`:

```typescript
const authHeader = request.headers.get("authorization")
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

Then set `CRON_SECRET` in your environment variables and include it in your cron job requests.

## Academic Year Logic

The system uses the Indian academic year cycle (April to March):

- **April 1 - December 31**: Academic year starts in the current calendar year
  - Example: April 2025 = Academic Year 2025-26
- **January 1 - March 31**: Academic year started in the previous calendar year
  - Example: February 2025 = Academic Year 2024-25

## What Gets Updated

For each exam that needs updating, the following dates are incremented by 1 year:
- Exam Date
- Registration Start Date
- Registration End Date
- Result Date

## Example Output

When you run the update script:

```
🔄 Starting automatic exam date update...
📅 Current Academic Year: 2025-2026

📊 Found 7 active exams to check

  ✅ Updated: CAT (Common Admission Test)
     2024-2025 → 2025-2026
     Exam Date: 11/23/2025
  ✅ Updated: JEE Main (Joint Entrance Examination)
     2024-2025 → 2025-2026
     Exam Date: 1/24/2026
  ⏭️  Skipped: NEET (Academic Year: 2025-2026)

✨ Update completed!
   ✅ Updated: 5 exams
   ⏭️  Skipped: 2 exams (already current)
```

## Testing

To test the system:

1. **Check current academic year**:
   ```typescript
   import { getCurrentAcademicYear } from "@/lib/examDateUpdater"
   console.log(getCurrentAcademicYear()) // Returns current academic year start
   ```

2. **Test date incrementing**:
   ```typescript
   import { incrementDateByYear } from "@/lib/examDateUpdater"
   const oldDate = new Date("2024-11-24")
   const newDate = incrementDateByYear(oldDate)
   console.log(newDate) // 2025-11-24
   ```

3. **Run update in dry-run mode** (you can add this feature):
   The script will show what would be updated before actually updating.

## Troubleshooting

### Dates Not Updating

1. **Check if exams are active**: Only active exams are updated
2. **Verify academic year**: Exams from current/future academic years are skipped
3. **Check database connection**: Ensure `DATABASE_URL` is set correctly

### Cron Job Not Running

1. **Verify cron configuration**: Check `vercel.json` for correct schedule
2. **Check logs**: Review Vercel function logs for errors
3. **Test endpoint manually**: Call the API endpoint directly to verify it works

### Wrong Dates After Update

1. **Check date patterns**: The system preserves month/day, only increments year
2. **Verify exam dates**: Some exams may have irregular schedules
3. **Manual override**: You can always update dates manually in the database

## Future Enhancements

Potential improvements:
- [ ] Web scraping to fetch actual dates from official websites
- [ ] Email notifications when dates are updated
- [ ] Dry-run mode to preview changes
- [ ] Support for exams with multiple sessions per year
- [ ] Historical date tracking
- [ ] Integration with official exam APIs (if available)

## Related Files

- `src/lib/examDateUpdater.ts` - Utility functions for date calculations
- `src/db/auto-update-exam-dates.ts` - Main update script
- `src/app/api/cron/update-exam-dates/route.ts` - API endpoint for cron jobs
- `src/db/seed-exams.ts` - Initial exam data seeding

