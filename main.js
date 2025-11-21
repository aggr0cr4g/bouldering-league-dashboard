/**
 * Bouldering Competition Dashboard
 * Main JavaScript file for application state management and orchestration
 * Version: 2.0 - Rank stays with team/climber (not position-based) (2025-11-21)
 */

/**
 * AppState - Centralized state management object
 * Stores all raw data, computed aggregations, and UI state
 */
const AppState = {
  // ============================================
  // Raw Data (loaded from CSV files)
  // ============================================
  
  /**
   * Raw team data from teams.csv
   * Array of objects with: team_id, team_name, climber_id, climber_name, division
   */
  rawTeams: [],
  
  /**
   * Raw results data from results.csv
   * Array of objects with: comp_id, comp_date, boulder_id, climber_id,
   * attempts_to_zone, attempts_to_top, zone_completed, top_completed
   */
  rawResults: [],
  
  // ============================================
  // Computed Data (aggregated from raw data)
  // ============================================
  
  /**
   * Climber statistics aggregated across competitions
   * Map<climber_id, ClimberStats>
   * ClimberStats: {
   *   climber_id, climber_name, team_id, team_name, division,
   *   total_points, total_attempts, comp_breakdown
   * }
   */
  climberStats: new Map(),
  
  /**
   * Team statistics aggregated from climber stats
   * Map<team_id, TeamStats>
   * TeamStats: {
   *   team_id, team_name, total_points, total_attempts, climbers
   * }
   */
  teamStats: new Map(),
  
  /**
   * Division-grouped climber statistics
   * Map<division, Array<ClimberStats>>
   * Divisions: "Beginner", "Intermediate", "Advanced"
   */
  divisionStats: new Map(),
  
  /**
   * Fun statistics calculated from results
   * Object: {
   *   most_attempts_team: {team_name, attempts},
   *   most_attempts_boulder: {boulder_id, comp_id, attempts},
   *   least_attempts_boulder: {boulder_id, comp_id, attempts},
   *   try_hard_award: {climber_name, attempts, tops}
   * }
   */
  funStats: {},
  
  // ============================================
  // UI State
  // ============================================
  
  /**
   * Current competition filter selection
   * Values: 'all' | '1' | '2' | '3' | '4'
   */
  currentFilter: 'all',
  
  /**
   * Current sort state for tables
   * Object: {
   *   table: string | null,     // ID of currently sorted table
   *   column: string | null,    // Column being sorted
   *   direction: 'asc' | 'desc' // Sort direction
   * }
   */
  sortState: {
    table: null,
    column: null,
    direction: 'asc'
  },
  
  // ============================================
  // State Management Methods
  // ============================================
  
  /**
   * Initialize the application
   * Loads CSV data, computes all aggregations, and renders all sections
   * Called on page load
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Hide any previous errors
      hideError();
      
      // Load CSV data
      const { teams, results } = await loadAllData();
      this.rawTeams = teams;
      this.rawResults = results;
      
      // Compute all aggregations
      this.computeAllStats();
      
      // Render all UI sections
      this.renderAll();
      
      // Set up event listeners (will be implemented in tasks 6, 7, 10, 11)
      // this.setupEventListeners();
      
      // Update footer with data source info
      updateFooter();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      showError(`Initialization failed: ${error.message}`);
      
      // Update footer to show error state
      const footer = document.getElementById('footer-text');
      if (footer) {
        footer.textContent = 'Bouldering Competition Dashboard | Failed to load data';
      }
    }
  },
  
  /**
   * Apply competition filter and recalculate all statistics
   * Triggers recomputation of climberStats, teamStats, divisionStats, and funStats
   * Then re-renders all affected UI sections
   * @param {string} compId - Competition ID ('all', '1', '2', '3', or '4')
   */
  applyFilter(compId) {
    // Update current filter state
    this.currentFilter = compId;
    
    // Recompute all statistics with the new filter
    this.computeAllStats();
    
    // Re-render all sections that depend on filtered data
    this.renderAll();
  },
  
  /**
   * Refresh data by reloading CSV files
   * Clears current state and re-initializes from scratch
   * @returns {Promise<void>}
   */
  async refresh() {
    try {
      // Clear current state
      this.clearState();
      
      // Reload and reinitialize
      await this.initialize();
    } catch (error) {
      console.error('Failed to refresh data:', error);
      showError(`Refresh failed: ${error.message}`);
    }
  },
  
  /**
   * Clear all state data
   * Resets raw data, computed data, and UI state to initial values
   */
  clearState() {
    // Clear raw data
    this.rawTeams = [];
    this.rawResults = [];
    
    // Clear computed data
    this.climberStats.clear();
    this.teamStats.clear();
    this.divisionStats.clear();
    this.funStats = {};
    
    // Reset UI state
    this.currentFilter = 'all';
    this.sortState = {
      table: null,
      column: null,
      direction: 'asc'
    };
  },
  
  /**
   * Compute all statistics from raw data
   * Aggregates climber stats, team stats, division stats, and fun stats
   * Respects the current filter setting
   * (Will be fully implemented in tasks 5, 6, and 9)
   */
  computeAllStats() {
    // Filter results based on current filter
    const filteredResults = this.getFilteredResults();
    
    // Aggregate climber statistics
    this.climberStats = aggregateClimberStats(this.rawTeams, filteredResults);
    
    // Aggregate team statistics
    this.teamStats = aggregateTeamStats(this.climberStats, this.rawTeams);
    
    // Aggregate division statistics
    this.divisionStats = aggregateDivisionStats(this.climberStats, this.rawTeams);
    
    // Compute fun statistics
    this.funStats = computeFunStats(filteredResults, this.climberStats, this.teamStats, this.currentFilter);
  },
  
  /**
   * Get filtered results based on current filter setting
   * @returns {Array} Filtered results array
   */
  getFilteredResults() {
    return filterByComp(this.rawResults, this.currentFilter);
  },
  
  /**
   * Render all UI sections
   * Updates team leaderboard, individual leaderboards, division leaderboards, and fun stats
   * (Will be implemented in tasks 8, 9, 10)
   */
  renderAll() {
    // Render team leaderboard (task 8)
    renderTeamLeaderboard(this.teamStats);
    
    // Render individual leaderboard (task 8)
    renderIndividualLeaderboard(this.climberStats);
    
    // Render division leaderboards (task 8)
    renderDivisionLeaderboards(this.divisionStats);
    
    // Render fun stats (task 9)
    renderFunStats(this.funStats);
  },
  
  /**
   * Set up all event listeners
   * Attaches handlers for filter dropdown, search box, reload button, and table sorting
   * (Will be implemented in tasks 6, 7, 10, 11)
   */
  setupEventListeners() {
    // Set up filter dropdown (task 11)
    // setupFilters();
    
    // Set up search box (task 10)
    // setupSearch();
    
    // Set up reload button (task 4)
    // Set up table sorting (task 7)
  }
};

// ============================================
// CSV Loading and Parsing Functions
// ============================================

/**
 * Load a CSV file from a URL (local file or Google Sheets)
 * @param {string} url - URL or filename to load (e.g., 'teams.csv' or Google Sheets export URL)
 * @returns {Promise<string>} Raw CSV text content
 * @throws {Error} If file cannot be loaded
 */
async function loadCsv(url) {
  try {
    // Fetch with cache disabled to always get fresh data
    // Note: For Google Sheets, we rely on the cachebust parameter in the URL
    // Custom headers can cause CORS issues
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load data from ${url}: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return csvText;
  } catch (error) {
    if (error.message.includes('Failed to load')) {
      throw error;
    }
    
    // Provide helpful error message based on data source
    if (CONFIG.dataSource === 'google-sheets') {
      const sheetName = url.includes('2PACX-1vS0yY2okHbcpDM7Xx') ? 'Teams' : 'Results';
      throw new Error(`Unable to load ${sheetName} data from Google Sheets.\n\nPlease ensure:\n1. The sheet is published to the web:\n   • Open the sheet\n   • File → Share → Publish to web\n   • Select "Comma-separated values (.csv)"\n   • Click "Publish"\n2. The published URL in config.js is correct\n3. You have an internet connection\n\nError: ${error.message}`);
    } else {
      throw new Error(`Unable to load ${url}. Please ensure the file exists in the same directory as index.html.`);
    }
  }
}

/**
 * Load both teams and results data concurrently
 * Data can come from local CSV files or Google Sheets (configured in config.js)
 * Validates that required columns are present in each file
 * @returns {Promise<{teams: Array, results: Array}>} Parsed team and result data
 * @throws {Error} If files cannot be loaded or are invalid
 */
async function loadAllData() {
  try {
    // Get data source URLs from config
    const teamsUrl = getTeamsUrl();
    const resultsUrl = getResultsUrl();
    
    // Load both files concurrently
    const [teamsText, resultsText] = await Promise.all([
      loadCsv(teamsUrl),
      loadCsv(resultsUrl)
    ]);
    
    // Define required columns for each file
    const teamsRequiredColumns = ['team_id', 'team_name', 'climber_id', 'climber_name', 'division'];
    const resultsRequiredColumns = ['comp_id', 'comp_date', 'boulder_id', 'climber_id', 
                                     'attempts_to_zone', 'attempts_to_top', 'zone_completed', 'top_completed'];
    
    // Parse and validate teams data
    let teams;
    try {
      teams = parseCsv(teamsText, teamsRequiredColumns);
    } catch (error) {
      throw new Error(`Error parsing teams data: ${error.message}`);
    }
    
    // Parse and validate results data
    let results;
    try {
      results = parseCsv(resultsText, resultsRequiredColumns);
    } catch (error) {
      throw new Error(`Error parsing results data: ${error.message}`);
    }
    
    return { teams, results };
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

/**
 * Parse CSV text into an array of objects
 * Handles quoted fields, trims whitespace, and validates column counts
 * @param {string} csvText - Raw CSV text content
 * @param {Array<string>} requiredColumns - Array of column names that must be present
 * @returns {Array<Object>} Array of objects where keys are column headers
 * @throws {Error} If CSV is empty, malformed, or missing required columns
 */
function parseCsv(csvText, requiredColumns) {
  // Validate input
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Split into lines and remove empty lines
  const lines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Parse header row
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.trim());
  
  if (headers.length === 0) {
    throw new Error('CSV file has no columns');
  }
  
  // Validate required columns are present
  const missing = requiredColumns.filter(col => !headers.includes(col));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue; // Skip empty lines
    
    const values = parseCSVLine(line).map(v => v.trim());
    
    // Validate column count matches header count
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}. Skipping row.`);
      continue;
    }
    
    // Create object mapping headers to values
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields that may contain commas
 * @param {string} line - A single line from CSV file
 * @returns {Array<string>} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote (two quotes in a row)
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (not inside quotes)
      result.push(current);
      current = '';
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

// ============================================
// Scoring and Aggregation Functions
// ============================================

/**
 * Calculate points for a single result
 * Points are awarded as: 50 for zone completion + 50 for top completion
 * @param {Object} result - Result object with zone_completed and top_completed properties
 * @returns {number} Total points (0, 50, or 100)
 */
function computePoints(result) {
  const zonePoints = result.zone_completed == 1 ? 50 : 0;
  const topPoints = result.top_completed == 1 ? 50 : 0;
  return zonePoints + topPoints;
}

/**
 * Aggregate climber statistics from teams and results data
 * Calculates total points and attempts per climber, optionally filtered by competition
 * Includes all registered climbers, even those with no results (they will have 0 points and 0 attempts)
 * @param {Array} teams - Array of team data objects from teams.csv
 * @param {Array} results - Array of result objects from results.csv
 * @param {string|null} filterCompId - Optional competition ID to filter by ('1', '2', '3', '4', or null for all)
 * @returns {Map<string, Object>} Map of climber_id to ClimberStats objects
 */
function aggregateClimberStats(teams, results, filterCompId = null) {
  // Create a map of climber_id to climber info from teams data
  const climberInfo = new Map();
  
  teams.forEach(teamRow => {
    if (!climberInfo.has(teamRow.climber_id)) {
      climberInfo.set(teamRow.climber_id, {
        climber_id: teamRow.climber_id,
        climber_name: teamRow.climber_name,
        team_id: teamRow.team_id,
        team_name: teamRow.team_name,
        division: teamRow.division
      });
    }
  });
  
  // Initialize climber stats for ALL registered climbers (even those with no results)
  const climberStats = new Map();
  climberInfo.forEach((info, climberId) => {
    climberStats.set(climberId, {
      climber_id: info.climber_id,
      climber_name: info.climber_name,
      team_id: info.team_id,
      team_name: info.team_name,
      division: info.division,
      total_points: 0,
      total_attempts: 0,
      comp_breakdown: new Map()
    });
  });
  
  // Filter results if a competition filter is specified
  const filteredResults = filterCompId 
    ? results.filter(r => r.comp_id === filterCompId)
    : results;
  
  // Aggregate statistics for each climber from their results
  filteredResults.forEach(result => {
    const climberId = result.climber_id;
    
    // Skip if climber not found in teams data
    if (!climberStats.has(climberId)) {
      console.warn(`Climber ${climberId} in results but not found in teams data`);
      return;
    }
    
    const stats = climberStats.get(climberId);
    
    // Calculate points and attempts for this result
    const points = computePoints(result);
    const attempts = parseInt(result.attempts_to_zone || 0) + parseInt(result.attempts_to_top || 0);
    
    // Update totals
    stats.total_points += points;
    stats.total_attempts += attempts;
    
    // Update competition breakdown
    const compId = result.comp_id;
    if (!stats.comp_breakdown.has(compId)) {
      stats.comp_breakdown.set(compId, { points: 0, attempts: 0 });
    }
    const compStats = stats.comp_breakdown.get(compId);
    compStats.points += points;
    compStats.attempts += attempts;
  });
  
  return climberStats;
}

/**
 * Aggregate team statistics from climber statistics
 * Sums points and attempts for all climbers on each team
 * @param {Map<string, Object>} climberStats - Map of climber statistics from aggregateClimberStats
 * @param {Array} teams - Array of team data objects from teams.csv
 * @returns {Map<string, Object>} Map of team_id to TeamStats objects
 */
function aggregateTeamStats(climberStats, teams) {
  const teamStats = new Map();
  
  // Initialize team info from teams data
  teams.forEach(teamRow => {
    if (!teamStats.has(teamRow.team_id)) {
      teamStats.set(teamRow.team_id, {
        team_id: teamRow.team_id,
        team_name: teamRow.team_name,
        total_points: 0,
        total_attempts: 0,
        climbers: []
      });
    }
    
    const team = teamStats.get(teamRow.team_id);
    if (!team.climbers.includes(teamRow.climber_id)) {
      team.climbers.push(teamRow.climber_id);
    }
  });
  
  // Aggregate climber stats into team stats
  climberStats.forEach((stats, climberId) => {
    const teamId = stats.team_id;
    
    if (teamStats.has(teamId)) {
      const team = teamStats.get(teamId);
      team.total_points += stats.total_points;
      team.total_attempts += stats.total_attempts;
    }
  });
  
  return teamStats;
}

/**
 * Aggregate division statistics by grouping climbers by division
 * Creates separate arrays of climbers for each division
 * @param {Map<string, Object>} climberStats - Map of climber statistics from aggregateClimberStats
 * @param {Array} teams - Array of team data objects from teams.csv
 * @returns {Map<string, Array>} Map of division name to array of ClimberStats objects
 */
function aggregateDivisionStats(climberStats, teams) {
  const divisionStats = new Map();
  
  // Initialize divisions
  divisionStats.set('Beginner', []);
  divisionStats.set('Intermediate', []);
  divisionStats.set('Advanced', []);
  
  // Group climbers by division
  climberStats.forEach((stats, climberId) => {
    const division = stats.division;
    
    if (divisionStats.has(division)) {
      divisionStats.get(division).push(stats);
    } else {
      console.warn(`Unknown division: ${division} for climber ${climberId}`);
    }
  });
  
  return divisionStats;
}

/**
 * Filter results by competition ID
 * Supports "all" option to return unfiltered results
 * @param {Array} results - Array of result objects from results.csv
 * @param {string} compId - Competition ID ('all', '1', '2', '3', or '4')
 * @returns {Array} Filtered array of results
 */
function filterByComp(results, compId) {
  // If "all" is selected, return all results unfiltered
  if (compId === 'all') {
    return results;
  }
  
  // Filter results to only those matching the specified competition ID
  return results.filter(result => result.comp_id === compId);
}

/**
 * Compute fun statistics from results and aggregated data
 * Calculates most attempts by team, most/least attempts by boulder, and Try Hard Award
 * @param {Array} results - Array of result objects (filtered by competition if applicable)
 * @param {Map<string, Object>} climberStats - Map of climber statistics
 * @param {Map<string, Object>} teamStats - Map of team statistics
 * @param {string} filterCompId - Current competition filter ('all', '1', '2', '3', or '4')
 * @returns {Object} FunStats object with most_attempts_team, most_attempts_boulder, least_attempts_boulder, try_hard_award
 */
function computeFunStats(results, climberStats, teamStats, filterCompId = 'all') {
  const funStats = {
    most_attempts_team: null,
    most_attempts_boulder: null,
    least_attempts_boulder: null,
    try_hard_award: null,
    flash_master: null,
    efficiency_king: null,
    perfect_score: null,
    zone_hero: null
  };
  
  // Calculate most attempts by team
  if (teamStats.size > 0) {
    let maxAttempts = -1;
    let maxTeam = null;
    
    teamStats.forEach((team) => {
      if (team.total_attempts > maxAttempts) {
        maxAttempts = team.total_attempts;
        maxTeam = team;
      }
    });
    
    if (maxTeam) {
      funStats.most_attempts_team = {
        team_name: maxTeam.team_name,
        attempts: maxTeam.total_attempts
      };
    }
  }
  
  // Calculate most attempts by boulder and least attempts by boulder
  if (results.length > 0) {
    // Aggregate attempts per boulder
    const boulderAttempts = new Map();
    
    results.forEach(result => {
      const key = `${result.comp_id}:${result.boulder_id}`;
      const attempts = parseInt(result.attempts_to_zone || 0) + parseInt(result.attempts_to_top || 0);
      
      if (!boulderAttempts.has(key)) {
        boulderAttempts.set(key, {
          comp_id: result.comp_id,
          boulder_id: result.boulder_id,
          attempts: 0
        });
      }
      
      const boulderData = boulderAttempts.get(key);
      boulderData.attempts += attempts;
    });
    
    // Find most attempts boulder
    let maxBoulderAttempts = -1;
    let maxBoulder = null;
    
    boulderAttempts.forEach((boulder) => {
      if (boulder.attempts > maxBoulderAttempts) {
        maxBoulderAttempts = boulder.attempts;
        maxBoulder = boulder;
      }
    });
    
    if (maxBoulder) {
      funStats.most_attempts_boulder = {
        boulder_id: maxBoulder.boulder_id,
        comp_id: maxBoulder.comp_id,
        attempts: maxBoulder.attempts
      };
    }
    
    // Find least attempts boulder (excluding zero)
    let minBoulderAttempts = Infinity;
    let minBoulder = null;
    
    boulderAttempts.forEach((boulder) => {
      if (boulder.attempts > 0 && boulder.attempts < minBoulderAttempts) {
        minBoulderAttempts = boulder.attempts;
        minBoulder = boulder;
      }
    });
    
    if (minBoulder) {
      funStats.least_attempts_boulder = {
        boulder_id: minBoulder.boulder_id,
        comp_id: minBoulder.comp_id,
        attempts: minBoulder.attempts
      };
    }
  }
  
  // Calculate Try Hard Award (most attempts with at least one top, tie-breaker: most tops)
  if (climberStats.size > 0) {
    const candidates = [];
    
    climberStats.forEach((climber) => {
      // Check if climber has at least one top
      const climberResults = results.filter(r => r.climber_id === climber.climber_id);
      const hasTops = climberResults.some(r => r.top_completed == 1);
      const topCount = climberResults.filter(r => r.top_completed == 1).length;
      
      if (hasTops) {
        candidates.push({
          climber_name: climber.climber_name,
          attempts: climber.total_attempts,
          tops: topCount
        });
      }
    });
    
    if (candidates.length > 0) {
      // Sort by attempts (most first), then by tops (most first) for tie-breaker
      candidates.sort((a, b) => {
        if (a.attempts !== b.attempts) {
          return b.attempts - a.attempts; // Most attempts first
        }
        return b.tops - a.tops; // Most tops as tie-breaker
      });
      
      // Check for tie (same attempts AND same tops)
      const maxAttempts = candidates[0].attempts;
      const maxTops = candidates[0].tops;
      const winners = candidates.filter(c => c.attempts === maxAttempts && c.tops === maxTops);
      
      if (winners.length === 1) {
        funStats.try_hard_award = winners[0];
      } else {
        // Tie - show all
        funStats.try_hard_award = {
          climber_name: winners.map(w => w.climber_name).join(' & '),
          attempts: winners[0].attempts,
          tops: winners[0].tops,
          is_tie: true
        };
      }
    }
  }
  
  // Calculate Flash Master (most first-attempt tops, tie-breaker: fewest total attempts)
  if (results.length > 0 && climberStats.size > 0) {
    const flashCounts = new Map();
    
    results.forEach(result => {
      if (result.top_completed == 1 && result.attempts_to_top == 1) {
        const climberId = result.climber_id;
        flashCounts.set(climberId, (flashCounts.get(climberId) || 0) + 1);
      }
    });
    
    // Find climbers with most flashes
    let maxFlashes = 0;
    flashCounts.forEach(count => {
      if (count > maxFlashes) maxFlashes = count;
    });
    
    if (maxFlashes > 0) {
      // Get all climbers with max flashes
      const candidates = [];
      flashCounts.forEach((count, climberId) => {
        if (count === maxFlashes) {
          const climber = climberStats.get(climberId);
          if (climber) {
            candidates.push({
              climber_name: climber.climber_name,
              flashes: count,
              attempts: climber.total_attempts
            });
          }
        }
      });
      
      // Sort by attempts (fewest first) for tie-breaker
      candidates.sort((a, b) => a.attempts - b.attempts);
      
      // Check for tie
      const fewestAttempts = candidates[0].attempts;
      const winners = candidates.filter(c => c.attempts === fewestAttempts);
      
      if (winners.length === 1) {
        funStats.flash_master = winners[0];
      } else {
        // Tie - show all
        funStats.flash_master = {
          climber_name: winners.map(w => w.climber_name).join(' & '),
          flashes: winners[0].flashes,
          attempts: winners[0].attempts,
          is_tie: true
        };
      }
    }
  }
  
  // Calculate Efficiency King (best points per attempt ratio, tie: show all with same ratio)
  if (climberStats.size > 0) {
    const candidates = [];
    
    climberStats.forEach((climber) => {
      if (climber.total_attempts > 0) {
        const ratio = climber.total_points / climber.total_attempts;
        candidates.push({
          climber_name: climber.climber_name,
          ratio: ratio,
          ratio_display: ratio.toFixed(2)
        });
      }
    });
    
    if (candidates.length > 0) {
      // Sort by ratio (highest first)
      candidates.sort((a, b) => b.ratio - a.ratio);
      
      // Get all with best ratio (accounting for floating point precision)
      const bestRatio = candidates[0].ratio;
      const winners = candidates.filter(c => Math.abs(c.ratio - bestRatio) < 0.001);
      
      if (winners.length === 1) {
        funStats.efficiency_king = {
          climber_name: winners[0].climber_name,
          ratio: winners[0].ratio_display
        };
      } else {
        // Tie - show all
        funStats.efficiency_king = {
          climber_name: winners.map(w => w.climber_name).join(' & '),
          ratio: winners[0].ratio_display,
          is_tie: true
        };
      }
    }
  }
  
  // Calculate Perfect Score (climber who topped all boulders in a comp)
  if (results.length > 0 && climberStats.size > 0) {
    // Group results by comp and climber
    const compClimberTops = new Map();
    const compBoulderCounts = new Map();
    
    results.forEach(result => {
      const compId = result.comp_id;
      const climberId = result.climber_id;
      const key = `${compId}:${climberId}`;
      
      // Count unique boulders per comp
      if (!compBoulderCounts.has(compId)) {
        compBoulderCounts.set(compId, new Set());
      }
      compBoulderCounts.get(compId).add(result.boulder_id);
      
      // Count tops per climber per comp
      if (result.top_completed == 1) {
        if (!compClimberTops.has(key)) {
          compClimberTops.set(key, { climberId, compId, tops: 0 });
        }
        compClimberTops.get(key).tops++;
      }
    });
    
    // Find climbers who topped all boulders in a single comp
    // Group by comp to handle multiple winners in the same comp
    const perfectScoresByComp = new Map();
    
    compClimberTops.forEach((data) => {
      const totalBoulders = compBoulderCounts.get(data.compId)?.size || 0;
      if (data.tops === totalBoulders && totalBoulders > 0) {
        const climber = climberStats.get(data.climberId);
        if (climber) {
          // Calculate total attempts for this climber in this comp
          const climberCompResults = results.filter(r => 
            r.climber_id === data.climberId && r.comp_id === data.compId
          );
          const totalAttempts = climberCompResults.reduce((sum, r) => 
            sum + parseInt(r.attempts_to_zone || 0) + parseInt(r.attempts_to_top || 0), 0
          );
          
          if (!perfectScoresByComp.has(data.compId)) {
            perfectScoresByComp.set(data.compId, []);
          }
          perfectScoresByComp.get(data.compId).push({
            climber_name: climber.climber_name,
            climber_id: data.climberId,
            comp_id: data.compId,
            boulders: totalBoulders,
            attempts: totalAttempts
          });
        }
      }
    });
    
    // Compare ALL perfect scores across ALL comps to find the overall winner(s)
    if (perfectScoresByComp.size > 0) {
      // Flatten all perfect scores from all comps into one array
      let allPerfectScores = [];
      perfectScoresByComp.forEach((winners, compId) => {
        allPerfectScores.push(...winners);
      });
      
      // Sort by attempts (fewest first) - this is the tie-breaker
      allPerfectScores.sort((a, b) => a.attempts - b.attempts);
      
      // Find the fewest attempts
      const fewestAttempts = allPerfectScores[0].attempts;
      
      // Get all winners with the fewest attempts (could be from different comps)
      const overallWinners = allPerfectScores.filter(w => w.attempts === fewestAttempts);
      
      if (overallWinners.length === 1) {
        // Single overall winner
        funStats.perfect_score = overallWinners[0];
        
        // Count other perfect scores
        funStats.perfect_score.other_comps_count = allPerfectScores.length - 1;
      } else {
        // Multiple winners tied with same attempts
        // Check if they're all from the same comp
        const comps = new Set(overallWinners.map(w => w.comp_id));
        
        if (comps.size === 1) {
          // All tied winners from same comp
          funStats.perfect_score = {
            climber_name: overallWinners.map(w => w.climber_name).join(' & '),
            comp_id: overallWinners[0].comp_id,
            boulders: overallWinners[0].boulders,
            attempts: overallWinners[0].attempts,
            is_tie: true,
            winner_count: overallWinners.length,
            other_comps_count: allPerfectScores.length - overallWinners.length
          };
        } else {
          // Tied winners from different comps - show all with their comps
          const winnerText = overallWinners.map(w => `${w.climber_name} (Comp ${w.comp_id})`).join(' & ');
          funStats.perfect_score = {
            climber_name: winnerText,
            comp_id: 'Multiple',
            boulders: overallWinners[0].boulders,
            attempts: overallWinners[0].attempts,
            is_tie: true,
            winner_count: overallWinners.length,
            other_comps_count: allPerfectScores.length - overallWinners.length
          };
        }
      }
    }
  }
  
  // Calculate Zone Hero (most zones without tops, tie-breaker: fewest attempts)
  if (results.length > 0 && climberStats.size > 0) {
    const zoneOnlyCounts = new Map();
    
    results.forEach(result => {
      if (result.zone_completed == 1 && result.top_completed == 0) {
        const climberId = result.climber_id;
        zoneOnlyCounts.set(climberId, (zoneOnlyCounts.get(climberId) || 0) + 1);
      }
    });
    
    // Find max zones
    let maxZones = 0;
    zoneOnlyCounts.forEach(count => {
      if (count > maxZones) maxZones = count;
    });
    
    if (maxZones > 0) {
      // Get all climbers with max zones
      const candidates = [];
      zoneOnlyCounts.forEach((count, climberId) => {
        if (count === maxZones) {
          const climber = climberStats.get(climberId);
          if (climber) {
            candidates.push({
              climber_name: climber.climber_name,
              zones: count,
              attempts: climber.total_attempts
            });
          }
        }
      });
      
      // Sort by attempts (fewest first) for tie-breaker
      candidates.sort((a, b) => a.attempts - b.attempts);
      
      // Check for tie
      const fewestAttempts = candidates[0].attempts;
      const winners = candidates.filter(c => c.attempts === fewestAttempts);
      
      if (winners.length === 1) {
        funStats.zone_hero = winners[0];
      } else {
        // Tie - show all
        funStats.zone_hero = {
          climber_name: winners.map(w => w.climber_name).join(' & '),
          zones: winners[0].zones,
          attempts: winners[0].attempts,
          is_tie: true
        };
      }
    }
  }
  
  return funStats;
}

// ============================================
// Sorting Functions
// ============================================

/**
 * Set up sorting functionality for a table
 * Attaches click handlers to table headers with data-sort attributes
 * Supports ascending/descending toggle on repeated clicks
 * Adds visual indicators for current sort column and direction
 * @param {HTMLTableElement} table - The table element to make sortable
 * @param {Function} getSortValue - Optional function to extract sort value from a cell
 */
function setupSorting(table, getSortValue = null) {
  if (!table) {
    console.warn('setupSorting: table element is null or undefined');
    return;
  }
  
  const headers = table.querySelectorAll('thead th[data-sort]');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const sortKey = header.getAttribute('data-sort');
      const tbody = table.querySelector('tbody');
      
      if (!tbody) {
        console.warn('setupSorting: tbody not found in table');
        return;
      }
      
      // Determine sort direction
      let direction = 'asc';
      
      // Check if this header is already sorted
      if (header.classList.contains('sort-asc')) {
        direction = 'desc';
      } else if (header.classList.contains('sort-desc')) {
        direction = 'asc';
      }
      
      // Remove sort classes from all headers
      headers.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      
      // Add sort class to current header
      header.classList.add(`sort-${direction}`);
      
      // Update AppState sort state
      AppState.sortState = {
        table: table.id,
        column: sortKey,
        direction: direction
      };
      
      // Get all rows as an array
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      // Find the actual column index in the table for this sort key
      const allHeaders = Array.from(table.querySelectorAll('thead th'));
      const columnIndex = allHeaders.findIndex(h => h.getAttribute('data-sort') === sortKey);
      
      if (columnIndex === -1) {
        console.warn(`setupSorting: could not find column for sort key ${sortKey}`);
        return;
      }
      
      // Sort the rows
      rows.sort((rowA, rowB) => {
        // Get the cells using the actual column index
        const cellA = rowA.cells[columnIndex];
        const cellB = rowB.cells[columnIndex];
        
        if (!cellA || !cellB) return 0;
        
        // Get values to compare
        let valueA, valueB;
        
        if (getSortValue) {
          valueA = getSortValue(cellA, sortKey);
          valueB = getSortValue(cellB, sortKey);
        } else {
          valueA = cellA.textContent.trim();
          valueB = cellB.textContent.trim();
        }
        
        // Determine comparison based on data type
        let comparison = 0;
        
        // Check if values are numeric
        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          // Numeric comparison
          comparison = numA - numB;
        } else {
          // Case-insensitive text comparison
          comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
        
        // Apply direction
        return direction === 'asc' ? comparison : -comparison;
      });
      
      // Clear tbody and append sorted rows
      tbody.innerHTML = '';
      rows.forEach(row => {
        tbody.appendChild(row);
      });
      
      // Rank column stays with the team/climber - it represents their actual competition rank
      // We don't update it when sorting by other columns
    });
  });
}

/**
 * Numeric comparison function for sorting
 * Compares two values numerically (not alphabetically)
 * @param {string|number} a - First value
 * @param {string|number} b - Second value
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal
 */
function compareNumeric(a, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  
  // Handle NaN cases
  if (isNaN(numA) && isNaN(numB)) return 0;
  if (isNaN(numA)) return 1; // Put NaN values at the end
  if (isNaN(numB)) return -1;
  
  return numA - numB;
}

/**
 * Case-insensitive text comparison function for sorting
 * Compares two strings alphabetically, ignoring case
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal
 */
function compareText(a, b) {
  const strA = String(a || '').toLowerCase();
  const strB = String(b || '').toLowerCase();
  return strA.localeCompare(strB);
}

/**
 * Sort leaderboard data using three-level criteria
 * Primary: Total points (descending - higher is better)
 * Secondary: Total attempts (ascending - fewer is better)
 * Tertiary: Name (alphabetical)
 * @param {Array} data - Array of objects with total_points, total_attempts, and name properties
 * @param {string} nameKey - Key to use for name (e.g., 'team_name' or 'climber_name')
 * @returns {Array} Sorted array
 */
function sortLeaderboard(data, nameKey) {
  return [...data].sort((a, b) => {
    // Primary: Total points (descending)
    if (a.total_points !== b.total_points) {
      return b.total_points - a.total_points;
    }
    
    // Secondary: Total attempts (ascending - fewer is better)
    if (a.total_attempts !== b.total_attempts) {
      return a.total_attempts - b.total_attempts;
    }
    
    // Tertiary: Name (alphabetical, case-insensitive)
    return compareText(a[nameKey], b[nameKey]);
  });
}

// ============================================
// Leaderboard Rendering Functions
// ============================================

/**
 * Render team leaderboard table
 * Displays teams ranked by points, attempts, and name
 * Includes columns: Rank, Team, Total Points, Total Attempts
 * @param {Map<string, Object>} teamStats - Map of team statistics from aggregateTeamStats
 */
function renderTeamLeaderboard(teamStats) {
  const table = document.getElementById('team-leaderboard');
  if (!table) {
    console.error('Team leaderboard table not found');
    return;
  }
  
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error('Team leaderboard tbody not found');
    return;
  }
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Convert Map to array and sort using leaderboard criteria
  const teamsArray = Array.from(teamStats.values());
  const sortedTeams = sortLeaderboard(teamsArray, 'team_name');
  
  // Generate table rows with rank as data attribute
  sortedTeams.forEach((team, index) => {
    const row = document.createElement('tr');
    
    // Rank column - store actual rank as data attribute
    const rankCell = document.createElement('td');
    const actualRank = index + 1; // This is their true rank based on leaderboard sorting
    rankCell.textContent = actualRank;
    rankCell.setAttribute('data-rank', actualRank);
    row.appendChild(rankCell);
    
    // Team name column
    const teamCell = document.createElement('td');
    teamCell.textContent = team.team_name;
    row.appendChild(teamCell);
    
    // Total points column
    const pointsCell = document.createElement('td');
    pointsCell.textContent = team.total_points;
    pointsCell.setAttribute('data-type', 'number');
    row.appendChild(pointsCell);
    
    // Total attempts column
    const attemptsCell = document.createElement('td');
    attemptsCell.textContent = team.total_attempts;
    attemptsCell.setAttribute('data-type', 'number');
    row.appendChild(attemptsCell);
    
    tbody.appendChild(row);
  });
  
  // Set up sorting handlers only if not already set up
  if (!table.dataset.sortingInitialized) {
    setupSorting(table);
    table.dataset.sortingInitialized = 'true';
  }
}

/**
 * Render individual leaderboard table
 * Displays all climbers ranked by points, attempts, and name
 * Includes columns: Rank, Climber, Team, Division, Total Points, Total Attempts
 * @param {Map<string, Object>} climberStats - Map of climber statistics from aggregateClimberStats
 */
function renderIndividualLeaderboard(climberStats) {
  const table = document.getElementById('individual-leaderboard');
  if (!table) {
    console.error('Individual leaderboard table not found');
    return;
  }
  
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.error('Individual leaderboard tbody not found');
    return;
  }
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Convert Map to array and sort using leaderboard criteria
  const climbersArray = Array.from(climberStats.values());
  const sortedClimbers = sortLeaderboard(climbersArray, 'climber_name');
  
  // Generate table rows with rank as data attribute
  sortedClimbers.forEach((climber, index) => {
    const row = document.createElement('tr');
    
    // Rank column - store actual rank as data attribute
    const rankCell = document.createElement('td');
    const actualRank = index + 1; // This is their true rank based on leaderboard sorting
    rankCell.textContent = actualRank;
    rankCell.setAttribute('data-rank', actualRank);
    row.appendChild(rankCell);
    
    // Climber name column
    const climberCell = document.createElement('td');
    climberCell.textContent = climber.climber_name;
    row.appendChild(climberCell);
    
    // Team name column
    const teamCell = document.createElement('td');
    teamCell.textContent = climber.team_name;
    row.appendChild(teamCell);
    
    // Division column
    const divisionCell = document.createElement('td');
    divisionCell.textContent = climber.division;
    row.appendChild(divisionCell);
    
    // Total points column
    const pointsCell = document.createElement('td');
    pointsCell.textContent = climber.total_points;
    pointsCell.setAttribute('data-type', 'number');
    row.appendChild(pointsCell);
    
    // Total attempts column
    const attemptsCell = document.createElement('td');
    attemptsCell.textContent = climber.total_attempts;
    attemptsCell.setAttribute('data-type', 'number');
    row.appendChild(attemptsCell);
    
    tbody.appendChild(row);
  });
  
  // Set up sorting handlers only if not already set up
  if (!table.dataset.sortingInitialized) {
    setupSorting(table);
    table.dataset.sortingInitialized = 'true';
  }
}

/**
 * Render division-specific leaderboard tables
 * Creates three separate tables for Beginner, Intermediate, and Advanced divisions
 * Each table shows climbers filtered by division
 * @param {Map<string, Array>} divisionStats - Map of division name to array of climber stats
 */
function renderDivisionLeaderboards(divisionStats) {
  // Define the divisions and their corresponding table IDs
  const divisions = [
    { name: 'Beginner', tableId: 'beginner-leaderboard' },
    { name: 'Intermediate', tableId: 'intermediate-leaderboard' },
    { name: 'Advanced', tableId: 'advanced-leaderboard' }
  ];
  
  // Render each division leaderboard
  divisions.forEach(({ name, tableId }) => {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`${name} leaderboard table not found`);
      return;
    }
    
    const tbody = table.querySelector('tbody');
    if (!tbody) {
      console.error(`${name} leaderboard tbody not found`);
      return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Get climbers for this division
    const climbers = divisionStats.get(name) || [];
    
    // Sort climbers using leaderboard criteria
    const sortedClimbers = sortLeaderboard(climbers, 'climber_name');
    
    // Generate table rows with rank as data attribute
    sortedClimbers.forEach((climber, index) => {
      const row = document.createElement('tr');
      
      // Rank column - store actual rank as data attribute
      const rankCell = document.createElement('td');
      const actualRank = index + 1; // This is their true rank based on leaderboard sorting
      rankCell.textContent = actualRank;
      rankCell.setAttribute('data-rank', actualRank);
      row.appendChild(rankCell);
      
      // Climber name column
      const climberCell = document.createElement('td');
      climberCell.textContent = climber.climber_name;
      row.appendChild(climberCell);
      
      // Team name column
      const teamCell = document.createElement('td');
      teamCell.textContent = climber.team_name;
      row.appendChild(teamCell);
      
      // Total points column
      const pointsCell = document.createElement('td');
      pointsCell.textContent = climber.total_points;
      pointsCell.setAttribute('data-type', 'number');
      row.appendChild(pointsCell);
      
      // Total attempts column
      const attemptsCell = document.createElement('td');
      attemptsCell.textContent = climber.total_attempts;
      attemptsCell.setAttribute('data-type', 'number');
      row.appendChild(attemptsCell);
      
      tbody.appendChild(row);
    });
    
    // Set up sorting handlers only if not already set up
    if (!table.dataset.sortingInitialized) {
      setupSorting(table);
      table.dataset.sortingInitialized = 'true';
    }
  });
}

/**
 * Render fun statistics cards
 * Displays most attempts team, most/least attempts boulder, and Try Hard Award
 * @param {Object} funStats - Fun statistics object from computeFunStats
 */
function renderFunStats(funStats) {
  // Render most attempts team
  const mostAttemptsTeamCard = document.getElementById('most-attempts-team-card');
  if (mostAttemptsTeamCard && funStats.most_attempts_team && funStats.most_attempts_team.team_name) {
    const valueEl = mostAttemptsTeamCard.querySelector('.stat-value');
    const detailEl = mostAttemptsTeamCard.querySelector('.stat-detail');
    
    if (valueEl) {
      valueEl.textContent = funStats.most_attempts_team.team_name;
    }
    if (detailEl) {
      detailEl.textContent = `${funStats.most_attempts_team.attempts || 0} attempts`;
    }
  } else if (mostAttemptsTeamCard) {
    const valueEl = mostAttemptsTeamCard.querySelector('.stat-value');
    const detailEl = mostAttemptsTeamCard.querySelector('.stat-detail');
    if (valueEl) valueEl.textContent = '--';
    if (detailEl) detailEl.textContent = '-- attempts';
  }
  
  // Render most attempts boulder
  const mostAttemptsBoulderCard = document.getElementById('most-attempts-boulder-card');
  if (mostAttemptsBoulderCard && funStats.most_attempts_boulder && funStats.most_attempts_boulder.boulder_id) {
    const valueEl = mostAttemptsBoulderCard.querySelector('.stat-value');
    const detailEl = mostAttemptsBoulderCard.querySelector('.stat-detail');
    
    if (valueEl) {
      valueEl.textContent = `${funStats.most_attempts_boulder.boulder_id} (Comp ${funStats.most_attempts_boulder.comp_id})`;
    }
    if (detailEl) {
      detailEl.textContent = `${funStats.most_attempts_boulder.attempts || 0} attempts`;
    }
  } else if (mostAttemptsBoulderCard) {
    const valueEl = mostAttemptsBoulderCard.querySelector('.stat-value');
    const detailEl = mostAttemptsBoulderCard.querySelector('.stat-detail');
    if (valueEl) valueEl.textContent = '--';
    if (detailEl) detailEl.textContent = '-- attempts';
  }
  
  // Render least attempts boulder
  const leastAttemptsBoulderCard = document.getElementById('least-attempts-boulder-card');
  if (leastAttemptsBoulderCard && funStats.least_attempts_boulder && funStats.least_attempts_boulder.boulder_id) {
    const valueEl = leastAttemptsBoulderCard.querySelector('.stat-value');
    const detailEl = leastAttemptsBoulderCard.querySelector('.stat-detail');
    
    if (valueEl) {
      valueEl.textContent = `${funStats.least_attempts_boulder.boulder_id} (Comp ${funStats.least_attempts_boulder.comp_id})`;
    }
    if (detailEl) {
      detailEl.textContent = `${funStats.least_attempts_boulder.attempts || 0} attempts`;
    }
  } else if (leastAttemptsBoulderCard) {
    const valueEl = leastAttemptsBoulderCard.querySelector('.stat-value');
    const detailEl = leastAttemptsBoulderCard.querySelector('.stat-detail');
    if (valueEl) valueEl.textContent = '--';
    if (detailEl) detailEl.textContent = '-- attempts';
  }
  
  // Render Try Hard Award
  const tryHardAwardCard = document.getElementById('try-hard-award-card');
  if (tryHardAwardCard && funStats.try_hard_award && funStats.try_hard_award.climber_name) {
    const valueEl = tryHardAwardCard.querySelector('.stat-value');
    const detailEl = tryHardAwardCard.querySelector('.stat-detail');
    
    if (valueEl) {
      valueEl.textContent = funStats.try_hard_award.climber_name;
      if (funStats.try_hard_award.is_tie) {
        valueEl.style.fontSize = '1.2rem';
      } else {
        valueEl.style.fontSize = '';
      }
    }
    if (detailEl) {
      detailEl.textContent = `${funStats.try_hard_award.attempts || 0} attempts, ${funStats.try_hard_award.tops || 0} tops`;
    }
  } else if (tryHardAwardCard) {
    const valueEl = tryHardAwardCard.querySelector('.stat-value');
    const detailEl = tryHardAwardCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = '--';
      valueEl.style.fontSize = '';
    }
    if (detailEl) detailEl.textContent = '-- attempts, -- tops';
  }
  
  // Render Flash Master
  const flashMasterCard = document.getElementById('flash-master-card');
  if (flashMasterCard && funStats.flash_master && funStats.flash_master.climber_name) {
    const valueEl = flashMasterCard.querySelector('.stat-value');
    const detailEl = flashMasterCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = funStats.flash_master.climber_name;
      if (funStats.flash_master.is_tie) {
        valueEl.style.fontSize = '1.2rem';
      } else {
        valueEl.style.fontSize = '';
      }
    }
    if (detailEl) {
      let detail = `${funStats.flash_master.flashes || 0} first-attempt tops`;
      if (funStats.flash_master.attempts) {
        detail += ` (${funStats.flash_master.attempts} total attempts)`;
      }
      detailEl.textContent = detail;
    }
  } else if (flashMasterCard) {
    const valueEl = flashMasterCard.querySelector('.stat-value');
    const detailEl = flashMasterCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = '--';
      valueEl.style.fontSize = '';
    }
    if (detailEl) detailEl.textContent = '-- first-attempt tops';
  }
  
  // Render Efficiency King
  const efficiencyKingCard = document.getElementById('efficiency-king-card');
  if (efficiencyKingCard && funStats.efficiency_king && funStats.efficiency_king.climber_name) {
    const valueEl = efficiencyKingCard.querySelector('.stat-value');
    const detailEl = efficiencyKingCard.querySelector('.stat-detail');
    if (valueEl) valueEl.textContent = funStats.efficiency_king.climber_name;
    if (detailEl) detailEl.textContent = `${funStats.efficiency_king.ratio || '0.00'} points per attempt`;
  } else if (efficiencyKingCard) {
    const valueEl = efficiencyKingCard.querySelector('.stat-value');
    const detailEl = efficiencyKingCard.querySelector('.stat-detail');
    if (valueEl) valueEl.textContent = '--';
    if (detailEl) detailEl.textContent = '-- points per attempt';
  }
  
  // Render Perfect Score
  const perfectScoreCard = document.getElementById('perfect-score-card');
  if (perfectScoreCard && funStats.perfect_score && funStats.perfect_score.climber_name) {
    const valueEl = perfectScoreCard.querySelector('.stat-value');
    const detailEl = perfectScoreCard.querySelector('.stat-detail');
    
    if (valueEl) {
      valueEl.textContent = funStats.perfect_score.climber_name;
      // Adjust font size if multiple names
      if (funStats.perfect_score.is_tie) {
        valueEl.style.fontSize = '1.2rem';
      } else {
        valueEl.style.fontSize = '';
      }
    }
    
    if (detailEl) {
      let detailText = '';
      
      if (funStats.perfect_score.comp_id === 'Multiple') {
        // Tied winners from different comps
        detailText = `Tied across comps (${funStats.perfect_score.attempts || 0} attempts each)`;
      } else {
        // Single comp
        detailText = `Comp ${funStats.perfect_score.comp_id}: ${funStats.perfect_score.boulders || 0}/${funStats.perfect_score.boulders || 0} topped`;
        
        // Show attempts
        if (funStats.perfect_score.attempts) {
          detailText += ` (${funStats.perfect_score.attempts} attempts)`;
        }
      }
      
      // Show if there are other perfect scores
      if (funStats.perfect_score.other_comps_count > 0) {
        detailText += ` • +${funStats.perfect_score.other_comps_count} others`;
      }
      
      detailEl.textContent = detailText;
    }
  } else if (perfectScoreCard) {
    const valueEl = perfectScoreCard.querySelector('.stat-value');
    const detailEl = perfectScoreCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = '--';
      valueEl.style.fontSize = '';
    }
    if (detailEl) detailEl.textContent = 'All boulders topped!';
  }
  
  // Render Zone Hero
  const zoneHeroCard = document.getElementById('zone-hero-card');
  if (zoneHeroCard && funStats.zone_hero && funStats.zone_hero.climber_name) {
    const valueEl = zoneHeroCard.querySelector('.stat-value');
    const detailEl = zoneHeroCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = funStats.zone_hero.climber_name;
      if (funStats.zone_hero.is_tie) {
        valueEl.style.fontSize = '1.2rem';
      } else {
        valueEl.style.fontSize = '';
      }
    }
    if (detailEl) {
      let detail = `${funStats.zone_hero.zones || 0} zones without tops`;
      if (funStats.zone_hero.attempts) {
        detail += ` (${funStats.zone_hero.attempts} total attempts)`;
      }
      detailEl.textContent = detail;
    }
  } else if (zoneHeroCard) {
    const valueEl = zoneHeroCard.querySelector('.stat-value');
    const detailEl = zoneHeroCard.querySelector('.stat-detail');
    if (valueEl) {
      valueEl.textContent = '--';
      valueEl.style.fontSize = '';
    }
    if (detailEl) detailEl.textContent = 'Most zones without tops';
  }
  
  console.log('Fun stats rendered');
}

// ============================================
// Search Functions
// ============================================

/**
 * Debounce timer for search input
 */
let searchDebounceTimer = null;

/**
 * Set up search functionality
 * Attaches input handler to search box with debouncing to avoid excessive re-rendering
 * Debounces search input by 300ms to wait for user to finish typing
 */
function setupSearch() {
  const searchBox = document.getElementById('search-box');
  
  if (!searchBox) {
    console.warn('Search box not found');
    return;
  }
  
  searchBox.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    
    // Clear previous debounce timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // If query is empty, clear search results immediately
    if (query.length === 0) {
      clearSearchResults();
      return;
    }
    
    // Debounce search by 300ms
    searchDebounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  
  console.log('Search handler set up');
}

/**
 * Perform search for teams or climbers
 * Searches both teams and climbers and displays results
 * @param {string} query - Search query string
 */
function performSearch(query) {
  console.log(`Performing search for: "${query}"`);
  
  const searchSection = document.getElementById('search-results');
  const searchContent = document.getElementById('search-content');
  
  if (!searchSection || !searchContent) {
    console.error('Search results elements not found');
    return;
  }
  
  // Search for teams
  const teamResults = searchTeam(query);
  
  // Search for climbers
  const climberResults = searchClimber(query);
  
  // If no results found, display message
  if (teamResults.length === 0 && climberResults.length === 0) {
    searchContent.innerHTML = `<p class="no-results">No teams or climbers found matching "${query}"</p>`;
    searchSection.style.display = 'block';
    return;
  }
  
  // Build results HTML
  let html = '';
  
  // Display team results
  if (teamResults.length > 0) {
    html += '<div class="search-results-group">';
    html += `<h3>Teams (${teamResults.length} match${teamResults.length > 1 ? 'es' : ''})</h3>`;
    teamResults.forEach(result => {
      html += renderTeamSearchResult(result);
    });
    html += '</div>';
  }
  
  // Display climber results
  if (climberResults.length > 0) {
    html += '<div class="search-results-group">';
    html += `<h3>Climbers (${climberResults.length} match${climberResults.length > 1 ? 'es' : ''})</h3>`;
    climberResults.forEach(result => {
      html += renderClimberSearchResult(result);
    });
    html += '</div>';
  }
  
  searchContent.innerHTML = html;
  searchSection.style.display = 'block';
  
  console.log(`Search complete: ${teamResults.length} teams, ${climberResults.length} climbers`);
}

/**
 * Search for teams by name (partial match, case-insensitive)
 * Returns team information including all members with their stats
 * @param {string} query - Search query string
 * @returns {Array} Array of team search results
 */
function searchTeam(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  const processedTeams = new Set();
  
  // Search through team stats for matching team names
  AppState.teamStats.forEach((teamData, teamId) => {
    if (processedTeams.has(teamId)) return;
    
    // Check if team name matches query (partial, case-insensitive)
    if (teamData.team_name.toLowerCase().includes(queryLower)) {
      // Get all climbers on this team
      const teamMembers = [];
      
      AppState.climberStats.forEach((climberData) => {
        if (climberData.team_id === teamId) {
          teamMembers.push({
            climber_name: climberData.climber_name,
            division: climberData.division,
            total_points: climberData.total_points,
            total_attempts: climberData.total_attempts
          });
        }
      });
      
      results.push({
        team_id: teamId,
        team_name: teamData.team_name,
        total_points: teamData.total_points,
        total_attempts: teamData.total_attempts,
        members: teamMembers
      });
      
      processedTeams.add(teamId);
    }
  });
  
  return results;
}

/**
 * Search for climbers by name (partial match, case-insensitive)
 * Returns detailed results for each climber including per-competition breakdown
 * @param {string} query - Search query string
 * @returns {Array} Array of climber search results
 */
function searchClimber(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  // Search through climber stats for matching climber names
  AppState.climberStats.forEach((climberData, climberId) => {
    // Check if climber name matches query (partial, case-insensitive)
    if (climberData.climber_name.toLowerCase().includes(queryLower)) {
      // Get detailed results for this climber from raw results
      const climberResults = AppState.rawResults
        .filter(r => r.climber_id === climberId)
        .map(r => ({
          comp_id: r.comp_id,
          comp_date: r.comp_date,
          boulder_id: r.boulder_id,
          attempts_to_zone: parseInt(r.attempts_to_zone || 0),
          attempts_to_top: parseInt(r.attempts_to_top || 0),
          zone_completed: parseInt(r.zone_completed || 0),
          top_completed: parseInt(r.top_completed || 0),
          points: computePoints(r)
        }));
      
      results.push({
        climber_id: climberId,
        climber_name: climberData.climber_name,
        team_name: climberData.team_name,
        division: climberData.division,
        total_points: climberData.total_points,
        total_attempts: climberData.total_attempts,
        results: climberResults
      });
    }
  });
  
  return results;
}

/**
 * Render team search result HTML
 * @param {Object} teamResult - Team search result object
 * @returns {string} HTML string for team result
 */
function renderTeamSearchResult(teamResult) {
  let html = '<div class="search-result-card team-result">';
  html += `<h4>${teamResult.team_name}</h4>`;
  html += `<p><strong>Team Totals:</strong> ${teamResult.total_points} points, ${teamResult.total_attempts} attempts</p>`;
  
  if (teamResult.members.length > 0) {
    html += '<table class="search-result-table">';
    html += '<thead><tr><th>Climber</th><th>Division</th><th>Points</th><th>Attempts</th></tr></thead>';
    html += '<tbody>';
    
    teamResult.members.forEach(member => {
      html += '<tr>';
      html += `<td>${member.climber_name}</td>`;
      html += `<td>${member.division}</td>`;
      html += `<td>${member.total_points}</td>`;
      html += `<td>${member.total_attempts}</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Render climber search result HTML
 * @param {Object} climberResult - Climber search result object
 * @returns {string} HTML string for climber result
 */
function renderClimberSearchResult(climberResult) {
  let html = '<div class="search-result-card climber-result">';
  html += `<h4>${climberResult.climber_name}</h4>`;
  html += `<p><strong>Team:</strong> ${climberResult.team_name} | <strong>Division:</strong> ${climberResult.division}</p>`;
  html += `<p><strong>Totals:</strong> ${climberResult.total_points} points, ${climberResult.total_attempts} attempts</p>`;
  
  if (climberResult.results.length > 0) {
    html += '<table class="search-result-table">';
    html += '<thead><tr><th>Comp</th><th>Date</th><th>Boulder</th><th>Zone</th><th>Top</th><th>Points</th><th>Attempts</th></tr></thead>';
    html += '<tbody>';
    
    climberResult.results.forEach(result => {
      html += '<tr>';
      html += `<td>${result.comp_id}</td>`;
      html += `<td>${result.comp_date}</td>`;
      html += `<td>${result.boulder_id}</td>`;
      html += `<td>${result.zone_completed ? '✓' : '✗'}</td>`;
      html += `<td>${result.top_completed ? '✓' : '✗'}</td>`;
      html += `<td>${result.points}</td>`;
      html += `<td>${result.attempts_to_zone + result.attempts_to_top}</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Clear search results display
 */
function clearSearchResults() {
  const searchSection = document.getElementById('search-results');
  const searchContent = document.getElementById('search-content');
  
  if (searchSection) {
    searchSection.style.display = 'none';
  }
  
  if (searchContent) {
    searchContent.innerHTML = '';
  }
}

// ============================================
// Filter Functions
// ============================================

/**
 * Set up competition filter functionality
 * Attaches change handler to filter dropdown to trigger filter updates
 * Updates all dashboard sections when filter changes
 */
function setupFilters() {
  const filterDropdown = document.getElementById('comp-filter');
  
  if (!filterDropdown) {
    console.warn('Competition filter dropdown not found');
    return;
  }
  
  filterDropdown.addEventListener('change', (event) => {
    const selectedCompId = event.target.value;
    console.log(`Filter changed to: ${selectedCompId}`);
    
    // Apply the filter through AppState
    AppState.applyFilter(selectedCompId);
  });
  
  console.log('Filter handler set up');
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.AppState = AppState;
  window.computePoints = computePoints;
  window.aggregateClimberStats = aggregateClimberStats;
  window.aggregateTeamStats = aggregateTeamStats;
  window.aggregateDivisionStats = aggregateDivisionStats;
  window.filterByComp = filterByComp;
  window.computeFunStats = computeFunStats;
  window.setupSorting = setupSorting;
  window.sortLeaderboard = sortLeaderboard;
  window.compareNumeric = compareNumeric;
  window.compareText = compareText;
  window.renderTeamLeaderboard = renderTeamLeaderboard;
  window.renderIndividualLeaderboard = renderIndividualLeaderboard;
  window.renderDivisionLeaderboards = renderDivisionLeaderboards;
  window.renderFunStats = renderFunStats;
  window.setupSearch = setupSearch;
  window.searchTeam = searchTeam;
  window.searchClimber = searchClimber;
  window.performSearch = performSearch;
  window.clearSearchResults = clearSearchResults;
  window.setupFilters = setupFilters;
}

// ============================================
// UI Helper Functions
// ============================================

/**
 * Display an error message to the user
 * Shows the error in a prominent error display section
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    console.error('Error displayed to user:', message);
  } else {
    console.error('Error display element not found. Error:', message);
  }
}

/**
 * Hide the error message display
 */
function hideError() {
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.style.display = 'none';
    errorDisplay.textContent = '';
  }
}

// ============================================
// Application Entry Point
// ============================================

/**
 * Update footer text with data source information
 */
function updateFooter() {
  const footer = document.getElementById('footer-text');
  if (!footer) return;
  
  if (CONFIG.dataSource === 'google-sheets') {
    footer.textContent = 'Bouldering Competition Dashboard | Data loaded from Google Sheets';
  } else {
    footer.textContent = 'Bouldering Competition Dashboard | Data loaded from teams.csv and results.csv';
  }
}

/**
 * Initialize application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing application...');
  
  // Set up reload button
  const reloadBtn = document.getElementById('reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', async () => {
      console.log('Reload button clicked');
      await AppState.refresh();
    });
  }
  
  // Set up competition filter
  setupFilters();
  
  // Set up search functionality
  setupSearch();
  
  // Set up fun stats info toggle
  const toggleButton = document.getElementById('toggle-stats-info');
  const infoContent = document.getElementById('stats-info-content');
  
  if (toggleButton && infoContent) {
    toggleButton.addEventListener('click', () => {
      const isVisible = infoContent.style.display !== 'none';
      
      if (isVisible) {
        infoContent.style.display = 'none';
        toggleButton.textContent = 'ℹ️ What do these awards mean?';
      } else {
        infoContent.style.display = 'block';
        toggleButton.textContent = '✖️ Hide award explanations';
      }
    });
  }
  
  // Initialize the application
  AppState.initialize();
});
