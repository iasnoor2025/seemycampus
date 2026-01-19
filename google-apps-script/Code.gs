/**
 * Google Apps Script Web App for Attendance Records
 * Handles POST requests from Next.js API to write attendance records to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this entire file to Google Apps Script editor
 * 2. Update SHEET_NAME if your sheet tab has a different name
 * 3. Deploy as Web App (Deploy → New deployment → Web app)
 * 4. Copy the Web App URL and add it to your .env file as GOOGLE_APPS_SCRIPT_URL
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
