# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for attendance records.

## Overview

The attendance system can automatically sync attendance records to Google Sheets using Google Apps Script. This allows you to:
- View attendance data in a familiar spreadsheet format
- Export data easily
- Share attendance reports with stakeholders
- Use Google Sheets formulas and charts for analysis

## Setup Steps

### 1. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Attendance Records" or similar
4. Create a sheet named "Attendance" (or update the script with your sheet name)
5. Add headers in Row 1:
   - Column A: Employee ID
   - Column B: Employee Name
   - Column C: Employee Email
   - Column D: Date
   - Column E: Check-In Time
   - Column F: Check-Out Time
   - Column G: Status
   - Column H: Check-In Status
   - Column I: Check-Out Status
   - Column J: Total Hours

### 2. Create Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default code and paste the following:

```javascript
/**
 * Google Apps Script Web App for Attendance Records
 * Handles POST requests from Next.js API to write attendance records to Google Sheets
 */

// Configuration - Update these with your sheet details
const SHEET_NAME = "Attendance"; // Name of your sheet tab
const START_ROW = 2; // Row to start writing data (Row 1 is headers)

/**
 * Handle POST requests from Next.js API
 */
function doPost(e) {
  try {
    // Parse the request body
    const requestData = JSON.parse(e.postData.contents);
    
    // Validate request
    if (!requestData.action || requestData.action !== "writeAttendance") {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Invalid action" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!requestData.data) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Missing data" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Write attendance record to sheet
    const result = writeAttendanceRecord(requestData.data);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Record written successfully", row: result.row })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Write attendance record to Google Sheet
 */
function writeAttendanceRecord(data) {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 10).setValues([[
        "Employee ID",
        "Employee Name",
        "Employee Email",
        "Date",
        "Check-In Time",
        "Check-Out Time",
        "Status",
        "Check-In Status",
        "Check-Out Status",
        "Total Hours"
      ]]);
      // Format header row
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
      sheet.getRange(1, 1, 1, 10).setBackground("#4285f4");
      sheet.getRange(1, 1, 1, 10).setFontColor("#ffffff");
    }
    
    // Find the next empty row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Prepare row data
    const rowData = [
      data.employeeId || "",
      data.employeeName || "",
      data.employeeEmail || "",
      data.date || "",
      data.checkInTime || "",
      data.checkOutTime || "",
      data.status || "",
      data.checkInStatus || "",
      data.checkOutStatus || "",
      data.totalHours || "",
    ];
    
    // Write data to sheet
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Format the row (optional)
    sheet.getRange(nextRow, 1, 1, rowData.length).setBorder(
      true, true, true, true, true, true,
      "#cccccc", SpreadsheetApp.BorderStyle.SOLID
    );
    
    return { success: true, row: nextRow };
    
  } catch (error) {
    console.error("Error writing attendance record:", error);
    throw error;
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: "Google Apps Script is running",
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** (💾 icon) and give your project a name (e.g., "Attendance Sync")

### 3. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Attendance Records Sync" (optional)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (or restrict to specific users if needed)
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the Next.js environment variable
6. Click **Done**

### 4. Configure Next.js Environment Variable

1. Open your `.env` file (or create it from `.env.example`)
2. Add the Google Apps Script URL:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace `YOUR_SCRIPT_ID` with the actual script ID from your deployment URL.

### 5. Test the Integration

1. Record attendance via the Flutter app or admin dashboard
2. Check your Google Sheet - the record should appear automatically
3. If it doesn't sync immediately, you can manually trigger sync:
   - Go to `/dashboard/attendance` (admin dashboard)
   - Records with "Pending" sync status will sync automatically
   - Or use the sync API endpoint: `POST /api/attendance/sync-sheets`

## How It Works

1. **Attendance Recording**: When an employee checks in/out:
   - Record is saved to PostgreSQL database
   - `syncedToSheets` flag is set to `false`
   - Background sync attempt is made to Google Sheets

2. **Google Sheets Sync**:
   - Next.js API calls Google Apps Script web app
   - Apps Script writes the record to Google Sheet
   - If successful, `syncedToSheets` flag is updated to `true`

3. **Failed Syncs**:
   - If sync fails, record remains with `syncedToSheets: false`
   - Can be retried manually via admin dashboard or sync API
   - Records are marked as "Pending" in the admin dashboard

## Manual Sync

If you need to sync pending records manually:

### Via Admin Dashboard
1. Go to `/dashboard/attendance`
2. Records with "Pending" status will sync automatically in the background
3. Or refresh the page to trigger sync

### Via API
```bash
POST /api/attendance/sync-sheets
Authorization: Bearer <admin-token>
```

Returns:
```json
{
  "success": true,
  "message": "Synced 5 records to Google Sheets",
  "syncedCount": 5,
  "failedCount": 0,
  "totalPending": 5
}
```

## Troubleshooting

### Records Not Syncing

1. **Check Environment Variable**:
   - Verify `GOOGLE_APPS_SCRIPT_URL` is set correctly
   - Make sure there are no extra spaces or quotes

2. **Check Google Apps Script**:
   - Open Apps Script editor
   - Go to **Executions** tab to see error logs
   - Check for permission errors

3. **Check Sheet Name**:
   - Ensure sheet name matches `SHEET_NAME` in the script
   - Default is "Attendance"

4. **Check Permissions**:
   - Make sure web app is deployed with "Anyone" access
   - Or ensure your Next.js server IP is whitelisted

5. **Check Server Logs**:
   - Look for `[Google Sheets]` log messages
   - Check for timeout or network errors

### Common Errors

- **"Invalid action"**: Check that the payload structure matches expected format
- **"Missing data"**: Ensure all required fields are present
- **Timeout errors**: Google Apps Script may be slow - records will retry automatically
- **Permission denied**: Check web app deployment settings

## Security Notes

1. **Web App URL**: Keep your Google Apps Script URL secure - don't commit it to public repositories
2. **Access Control**: Consider restricting web app access to specific users/IPs if needed
3. **API Key**: You can add API key validation in the Apps Script if desired
4. **Rate Limiting**: The system includes delays between syncs to avoid rate limiting

## Sheet Structure

The Google Sheet will have the following columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | Employee ID | Unique employee identifier |
| B | Employee Name | Full name of employee |
| C | Employee Email | Email address |
| D | Date | Date in YYYY-MM-DD format |
| E | Check-In Time | Time in HH:MM:SS format |
| F | Check-Out Time | Time in HH:MM:SS format |
| G | Status | "present", "absent", "late" |
| H | Check-In Status | "early", "on-time", "late" |
| I | Check-Out Status | "early", "on-time", "late" |
| J | Total Hours | Hours worked (e.g., "8h 30m") |

## Next Steps

After setup:
1. Test with a few attendance records
2. Verify data appears correctly in Google Sheets
3. Set up any formulas or charts you need
4. Share the sheet with stakeholders if needed
