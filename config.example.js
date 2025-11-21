/**
 * Configuration for data sources - EXAMPLE FILE
 * 
 * Copy this file to config.js and update with your settings
 * 
 * To use Google Sheets:
 * 1. Make sure your Google Sheet is published to the web:
 *    - File → Share → Publish to web
 *    - Choose "Entire Document" or specific sheet
 *    - Select "Comma-separated values (.csv)"
 *    - Click "Publish"
 * 
 * 2. Get the sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * 
 * 3. The CSV export URL format is:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=GID
 */

const CONFIG = {
  // Data source mode: 'local' or 'google-sheets'
  dataSource: 'local', // Change to 'google-sheets' to use Google Sheets
  
  // Local CSV file paths (used when dataSource is 'local')
  local: {
    teamsFile: 'teams.csv',
    resultsFile: 'results.csv'
  },
  
  // Google Sheets configuration (used when dataSource is 'google-sheets')
  googleSheets: {
    // OPTION 1: Use the published URL directly (RECOMMENDED - easier!)
    // After publishing to web (File → Share → Publish to web), copy the full URL here
    teamsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv',
    resultsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv',
    
    // OPTION 2: Use sheet ID and GID (alternative method)
    // Only needed if not using the published URLs above
    teamsSheetId: 'YOUR_TEAMS_SHEET_ID_HERE',
    teamsGid: '0', // First tab (usually 0, check URL if different)
    resultsSheetId: 'YOUR_RESULTS_SHEET_ID_HERE',
    resultsGid: '0' // First tab (usually 0, check URL if different)
  }
};

/**
 * Get the URL for the teams data source
 * @returns {string} URL to fetch teams data from
 */
function getTeamsUrl() {
  if (CONFIG.dataSource === 'google-sheets') {
    // Prefer the published URL if available
    if (CONFIG.googleSheets.teamsUrl) {
      return CONFIG.googleSheets.teamsUrl;
    }
    // Fallback to constructing URL from sheet ID
    const { teamsSheetId, teamsGid } = CONFIG.googleSheets;
    return `https://docs.google.com/spreadsheets/d/${teamsSheetId}/export?format=csv&gid=${teamsGid}`;
  }
  return CONFIG.local.teamsFile;
}

/**
 * Get the URL for the results data source
 * @returns {string} URL to fetch results data from
 */
function getResultsUrl() {
  if (CONFIG.dataSource === 'google-sheets') {
    // Prefer the published URL if available
    if (CONFIG.googleSheets.resultsUrl) {
      return CONFIG.googleSheets.resultsUrl;
    }
    // Fallback to constructing URL from sheet ID
    const { resultsSheetId, resultsGid } = CONFIG.googleSheets;
    return `https://docs.google.com/spreadsheets/d/${resultsSheetId}/export?format=csv&gid=${resultsGid}`;
  }
  return CONFIG.local.resultsFile;
}
