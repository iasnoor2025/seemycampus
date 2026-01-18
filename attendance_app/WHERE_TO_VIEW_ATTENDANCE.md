# Where to View Attendance Records

After scanning QR codes and saving attendance, you can view the records in **two places**:

## 1. Flutter Mobile App (For Employees & Admins)

### For Employees:
- **Home Screen**: Shows today's attendance status (check-in/check-out times)
- **Note**: Employees can see their own records, but the "View History" button is currently only visible to admins

### For Admins:
- **Home Screen**: Shows today's attendance status
- **View History Button**: Click "View History" button on home screen to see all your attendance records
- **Features**:
  - View all your personal attendance records
  - See check-in and check-out times
  - See sync status (synced/pending)
  - Pull to refresh to reload records

**To Access:**
1. Open Flutter app
2. Login as admin
3. On home screen, tap "View History" button
4. View your attendance history

## 2. Admin Dashboard (Web) - NEW! ✨

### For Admins Only:
- **Location**: `https://seemycampus.com/dashboard/attendance`
- **Features**:
  - View **ALL** employee attendance records
  - Search by employee name or email
  - Filter by date
  - Export to CSV
  - See sync status for each record
  - View check-in/check-out times
  - See attendance status (present/absent/late)

**To Access:**
1. Go to `https://seemycampus.com/dashboard`
2. Login as admin
3. Click "Attendance Records" in the sidebar
4. View, search, filter, and export attendance data

## What Information is Shown?

### In Flutter App:
- Date
- Check-in time
- Check-out time
- Status (present/absent)
- Sync status (synced/pending)

### In Admin Dashboard:
- Date
- Employee name and email
- Check-in time
- Check-out time
- Status (present/absent/late)
- Sync status (synced to Google Sheets or pending)

## Data Flow

1. **Scan QR Code** → Flutter app records attendance locally
2. **Auto Sync** → Records sync to backend API automatically
3. **Backend Storage** → Records stored in PostgreSQL database
4. **View Records** → 
   - Employees: See in Flutter app (their own records)
   - Admins: See in Flutter app (their own) OR Admin Dashboard (all records)

## Notes

- Records are stored locally in Flutter app (SQLite) for offline access
- Records sync to backend when online
- Admin dashboard shows all records from the database
- Flutter app shows records from local storage (may need refresh to see latest)

## Troubleshooting

**Can't see records in Flutter app?**
- Make sure you're logged in
- Pull down to refresh the history screen
- Check if records are synced (look for sync status indicator)

**Can't see records in Admin Dashboard?**
- Make sure you're logged in as admin
- Check if records exist in the database
- Try refreshing the page

**Records not syncing?**
- Check internet connection
- Look for sync status indicator on home screen
- Try manual sync button if available
