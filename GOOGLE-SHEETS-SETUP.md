# 📊 Google Sheets Integration Guide

Load competition data directly from Google Sheets! Update your data in real-time without touching any code.

## ✨ Why Use Google Sheets?

- ✅ **Easy Updates**: Edit data in Google Sheets, refresh the dashboard
- ✅ **Collaboration**: Multiple people can update data simultaneously  
- ✅ **No File Management**: No need to download/upload CSV files
- ✅ **Real-time**: Changes appear after page refresh (1-2 minute delay)
- ✅ **Backup**: Google Sheets automatically saves versions
- ✅ **Accessible**: Update from any device with internet

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Your Google Sheets

You need **two separate Google Sheets**:

1. **Teams Sheet** - Team and climber information
2. **Results Sheet** - Competition results

You can create new sheets or use existing ones.

#### Teams Sheet Format

Your sheet must have these **exact column names** (case-sensitive):

| team_id | team_name | climber_id | climber_name | division |
|---------|-----------|------------|--------------|----------|
| T1 | K-Pop Dynamo Slabbers | C101 | Jane Doe | Intermediate |
| T1 | K-Pop Dynamo Slabbers | C102 | John Smith | Advanced |
| T2 | Boulder Crushers | C201 | Alice Johnson | Beginner |

**Column Descriptions:**
- `team_id` - Unique team identifier (e.g., T1, T2, T3)
- `team_name` - Name of the team
- `climber_id` - Unique climber identifier (e.g., C101, C102)
- `climber_name` - Full name of the climber
- `division` - Must be: `Beginner`, `Intermediate`, or `Advanced`

#### Results Sheet Format

Your sheet must have these **exact column names** (case-sensitive):

| comp_id | comp_date | boulder_id | climber_id | attempts_to_zone | attempts_to_top | zone_completed | top_completed |
|---------|-----------|------------|------------|------------------|-----------------|----------------|---------------|
| 1 | 2025-12-01 | #1 | C101 | 0 | 5 | 1 | 1 |
| 1 | 2025-12-01 | #2 | C101 | 0 | 8 | 1 | 0 |
| 1 | 2025-12-01 | #1 | C102 | 0 | 3 | 1 | 1 |

**Column Descriptions:**
- `comp_id` - Competition number (1, 2, 3, 4, etc.)
- `comp_date` - Date in YYYY-MM-DD format
- `boulder_id` - Boulder identifier (e.g., #1, #2, #3)
- `climber_id` - Must match a climber_id from Teams sheet
- `attempts_to_zone` - Set to `0` if not tracking separately
- `attempts_to_top` - Total attempts (or attempts to top if tracking separately)
- `zone_completed` - `1` if zone reached, `0` if not
- `top_completed` - `1` if top reached, `0` if not

**💡 Pro Tip:** If you're only tracking total attempts (not zone attempts separately), just set `attempts_to_zone` to `0` for all entries and put total attempts in `attempts_to_top`.

### Step 2: Publish Your Sheets to the Web

For **each** Google Sheet (Teams and Results):

1. **Open the Google Sheet**
2. Click **File** → **Share** → **Publish to web**
3. In the dialog that appears:
   - Under **"Link"**, select **Entire Document** (or the specific sheet tab)
   - Under **"Published content & settings"**, select **Comma-separated values (.csv)**
   - Click **Publish**
   - Click **OK** to confirm the warning

⚠️ **Important**: Your sheets must be published to the web for the dashboard to access them!

### Step 3: Copy the Published URLs

After publishing each sheet, Google will show you a link. **Copy these URLs!**

The URL will look like:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vS0yY2okHbcpDM7Xx.../pub?output=csv
```

**Save both URLs:**
- Teams Sheet URL
- Results Sheet URL

### Step 4: Update config.js

1. **Open `config.js`** in your project folder

2. **Update the configuration:**

```javascript
const CONFIG = {
  // Change this to 'google-sheets'
  dataSource: 'google-sheets',
  
  googleSheets: {
    // Paste your Teams sheet published URL here
    teamsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0yY2okHbcpDM7Xx.../pub?output=csv',
    
    // Paste your Results sheet published URL here
    resultsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEpETW5gtLjVpjd3S.../pub?output=csv'
  }
};
```

3. **Save the file**

### Step 5: Test It!

1. Open `index.html` in your browser (or run a local server)
2. The dashboard should load data from your Google Sheets
3. Check the browser console (F12) for any errors

**Success!** 🎉 Your dashboard is now connected to Google Sheets!

## 🔄 Updating Data

After setup, updating is easy:

1. **Edit your Google Sheet** (add results, update teams, etc.)
2. **Wait 1-2 minutes** for Google to update the published version
3. **Hard refresh** the dashboard page:
   - **Windows/Linux**: `Ctrl+Shift+R` or `Ctrl+F5`
   - **Mac**: `Cmd+Shift+R`
4. **Data updates automatically!**

Or click the **"Reload Data"** button in the dashboard.

### ⏱️ Why the Wait?

Google Sheets caches published data for ~1-5 minutes to improve performance. This is Google's behavior, not something we can control. The dashboard includes cache-busting to force fresh data, but Google's servers may still serve cached data for 1-2 minutes after you make changes.

## 🔍 Finding the GID (Sheet Tab ID)

If your data is on a specific tab (not the first one):

1. Open your Google Sheet
2. Click on the tab you want to use
3. Look at the URL - it will show: `#gid=123456789`
4. When publishing, select that specific sheet instead of "Entire Document"

## 🐛 Troubleshooting

### Dashboard shows "Failed to load data"

**Check:**
1. ✅ Sheets are published to the web (File → Share → Publish to web)
2. ✅ Published URLs in `config.js` are correct (should start with `https://docs.google.com/spreadsheets/d/e/2PACX-...`)
3. ✅ Column names match exactly (case-sensitive!)
4. ✅ You have an internet connection
5. ✅ Open browser console (F12) to see detailed error messages

### Data looks wrong or incomplete

**Check:**
1. ✅ All required columns are present
2. ✅ No extra spaces in column names
3. ✅ Data types are correct:
   - Numbers for attempts (not text)
   - `0` or `1` for completed fields (not "yes"/"no")
   - Division names match exactly: `Beginner`, `Intermediate`, or `Advanced`
4. ✅ `climber_id` in Results sheet matches `climber_id` in Teams sheet

### Changes not showing up

**Try these steps in order:**
1. ⏱️ **Wait 1-2 minutes** - Google caches published sheets
2. 🔄 **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. 🔄 **Use the Reload Data button** - Forces a fresh fetch
4. 🔄 **Clear browser cache** - Last resort if still not working
5. 🔍 **Check the browser console** (F12) - Look for error messages

### CORS errors in console

This usually means the sheet isn't published to the web. Make sure you:
- Published the sheet (File → Share → Publish to web)
- Selected **CSV format** (not Web page)
- Clicked **"Publish"** (not just "Share")

### "Cannot read properties of undefined" errors

This usually means:
- Column names don't match exactly (check spelling and case)
- Required columns are missing
- Data format is incorrect (text instead of numbers)

## 🔒 Privacy & Security

**Important Notes:**

- Published sheets are **publicly accessible** to anyone with the link
- Don't include sensitive information (emails, phone numbers, addresses)
- Anyone can view the data, but only you can edit it (unless you share edit access)
- Consider using a separate Google account for competition data

**To keep your config private:**
1. Uncomment `config.js` in `.gitignore`
2. Don't commit your `config.js` to GitHub
3. Users can copy `config.example.js` to `config.js` and add their own URLs

## 🔄 Switching Back to Local Files

To use local CSV files instead:

1. Open `config.js`
2. Change `dataSource: 'google-sheets'` to `dataSource: 'local'`
3. Make sure `teams.csv` and `results.csv` are in the same folder as `index.html`

## 📝 Example Sheets

Want to see working examples? Check out these templates:

**Teams Sheet Template:**
```
team_id,team_name,climber_id,climber_name,division
T1,Team Alpha,C101,Alice Smith,Intermediate
T1,Team Alpha,C102,Bob Jones,Advanced
T2,Team Beta,C201,Charlie Brown,Beginner
```

**Results Sheet Template:**
```
comp_id,comp_date,boulder_id,climber_id,attempts_to_zone,attempts_to_top,zone_completed,top_completed
1,2025-12-01,#1,C101,0,5,1,1
1,2025-12-01,#2,C101,0,8,1,0
1,2025-12-01,#1,C102,0,3,1,1
```

## 💡 Tips & Best Practices

1. **Keep one person in charge** of updating sheets to avoid conflicts
2. **Test changes** on a copy first if making major updates
3. **Use data validation** in Google Sheets to prevent errors:
   - Dropdown for division (Beginner, Intermediate, Advanced)
   - Number validation for attempts
   - Checkbox for completed fields
4. **Document your column meanings** in a separate tab
5. **Back up your data** periodically (File → Download → CSV)
6. **Use Google Forms** to collect results, then link to your sheet
7. **Freeze the header row** (View → Freeze → 1 row) for easier scrolling
8. **Color-code divisions** for visual organization

## 🎯 Common Use Cases

### Adding a New Competition

1. Open Results sheet
2. Add new rows with `comp_id` = next number (e.g., 5)
3. Fill in all required columns
4. Refresh dashboard

### Adding a New Climber

1. Open Teams sheet
2. Add new row with unique `climber_id`
3. Fill in team info and division
4. Add their results to Results sheet
5. Refresh dashboard

### Fixing a Mistake

1. Edit the cell in Google Sheets
2. Wait 1-2 minutes
3. Hard refresh dashboard (`Ctrl+Shift+R`)

---

**Need help?** Check the browser console (F12) for detailed error messages, or refer to the main [README.md](README.md) for more information.

Happy climbing! 🧗‍♀️🎉
