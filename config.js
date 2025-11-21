/**
 * Configuration for data sources
 * 
 * You can use either local CSV files or Google Sheets as data sources.
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
 *    
 *    - SHEET_ID: The long ID from your sheet URL
 *    - GID: The sheet tab ID (0 for first tab, or find in URL after #gid=)
 */

const CONFIG = {
  // Data source mode: 'local' or 'google-sheets'
  dataSource: 'google-sheets',
  
  // Local CSV file paths (used when dataSource is 'local')
  local: {
    teamsFile: 'teams.csv',
    resultsFile: 'results.csv'
  },
  
  // Google Sheets configuration (used when dataSource is 'google-sheets')
  googleSheets: {
    // OPTION 1: Use the published URL directly (RECOMMENDED - easier!)
    // After publishing to web, copy the full URL here
    teamsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0yY2okHbcpDM7Xx-gdkyCQmj7SRxlyVqb4WZtMW4FJSOwbHn1XyEI_nsBpMqLJZrj3cZgLn8oa7lb/pub?output=csv',
    resultsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEpETW5gtLjVpjd3S_TvRKXfZTwcvNVDt8mRJ7Ec7ihaT5CdkYTizv7YM3-AqXIupGE0E1dTWYUkF6/pub?output=csv',
    
    // OPTION 2: Use sheet ID and GID (alternative method)
    // Leave these if you're using the URLs above
    teamsSheetId: '18jGmn1cRNeJfUhAezxnk6K9lzPftYlgcuoGqmvgpVD8',
    teamsGid: '0',
    resultsSheetId: '17d5Vk2cuyjwBHcLhvVWoZfSU2zjDRuindSyxd_D8b-I',
    resultsGid: '0'
  }
};

/**
 * Get the URL for the teams data source
 * @returns {string} URL to fetch teams data from
 */
function getTeamsUrl() {
  if (CONFIG.dataSource === 'google-sheets') {
    let url;
    // Prefer the published URL if available
    if (CONFIG.googleSheets.teamsUrl) {
      url = CONFIG.googleSheets.teamsUrl;
    } else {
      // Fallback to constructing URL from sheet ID
      const { teamsSheetId, teamsGid } = CONFIG.googleSheets;
      url = `https://docs.google.com/spreadsheets/d/${teamsSheetId}/export?format=csv&gid=${teamsGid}`;
    }
    // Add cache-busting parameter to force fresh data
    return `${url}${url.includes('?') ? '&' : '?'}cachebust=${Date.now()}`;
  }
  return CONFIG.local.teamsFile;
}

/**
 * Get the URL for the results data source
 * @returns {string} URL to fetch results data from
 */
function getResultsUrl() {
  if (CONFIG.dataSource === 'google-sheets') {
    let url;
    // Prefer the published URL if available
    if (CONFIG.googleSheets.resultsUrl) {
      url = CONFIG.googleSheets.resultsUrl;
    } else {
      // Fallback to constructing URL from sheet ID
      const { resultsSheetId, resultsGid } = CONFIG.googleSheets;
      url = `https://docs.google.com/spreadsheets/d/${resultsSheetId}/export?format=csv&gid=${resultsGid}`;
    }
    // Add cache-busting parameter to force fresh data
    return `${url}${url.includes('?') ? '&' : '?'}cachebust=${Date.now()}`;
  }
  return CONFIG.local.resultsFile;
}
