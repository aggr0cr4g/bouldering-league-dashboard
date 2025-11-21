# 🧗 Bouldering Competition Dashboard

A dynamic web dashboard for tracking and displaying bouldering competition results, team standings, and fun statistics. **Loads data directly from Google Sheets** for easy updates!

## 🌟 Features

- **📊 Google Sheets Integration**: Update data in real-time without touching code
- **🏆 Team Leaderboard**: Track team performance across competitions
- **🧗 Individual Leaderboards**: Overall and division-specific rankings (Beginner, Intermediate, Advanced)
- **🔍 Competition Filtering**: View results for specific competitions or all combined
- **🔎 Search Functionality**: Quickly find teams or climbers
- **� Fun Satatistics & Awards**:
  - 🏆 Try Hard Award (most attempts with tops)
  - ⚡ Flash Master (most first-attempt tops)
  - 🎯 Efficiency King (best points-per-attempt ratio)
  - 💯 Perfect Score (topped all boulders)
  - 🎪 Zone Hero (most zones without tops)
  - And more!
- **📊 Sortable Tables**: Click column headers to sort by any metric
- **⚖️ Fair Tie-Breaking**: Uses attempts as tie-breaker, shows all tied winners
- **� Auto Cmache-Busting**: Always fetches fresh data from Google Sheets

## 🚀 Quick Start

### Option 1: Use with Google Sheets (Recommended)

1. **Fork/Clone this repository**
2. **Set up your Google Sheets** (see [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md))
3. **Update `config.js`** with your published sheet URLs
4. **Deploy to GitHub Pages** (see below)

### Option 2: Use with Local CSV Files

1. **Fork/Clone this repository**
2. **Edit `config.js`**: Change `dataSource: 'google-sheets'` to `dataSource: 'local'`
3. **Update `teams.csv` and `results.csv`** with your data
4. **Deploy to GitHub Pages**

## 📦 What to Upload to GitHub

For GitHub Pages deployment, you need these files:

### Required Files:
```
✅ index.html
✅ main.js
✅ styles.css
✅ config.js (with your Google Sheets URLs)
✅ README.md
✅ GOOGLE-SHEETS-SETUP.md
```

### Optional Files:
```
📄 config.example.js (template for others)
📄 teams.csv (fallback if Google Sheets fails)
📄 results.csv (fallback if Google Sheets fails)
📄 package.json (for local development)
📄 GITHUB-PAGES-CHECKLIST.md (deployment checklist)
```

### Do NOT Upload:
```
❌ node_modules/ (too large, auto-generated)
❌ .vscode/ (editor config)
```

## 🚀 Deploy to GitHub Pages

1. **Create a new repository on GitHub**

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Bouldering Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch → `main`
   - Click Save
   - Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

4. **Done!** 🎉 Your dashboard is live and will update automatically when you edit your Google Sheets!

## 📊 Data Sources

The dashboard supports two data sources:

1. **Local CSV Files** (default) - Traditional file-based approach
2. **Google Sheets** - Load data directly from published Google Sheets

See [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md) for detailed Google Sheets integration instructions.

### CSV File Format

The dashboard loads data from two CSV files:

### teams.csv
```csv
team_id,team_name,climber_id,climber_name,division
T1,K-Pop Dynamo Slabbers,C101,Jane Doe,Intermediate
T1,K-Pop Dynamo Slabbers,C102,John Smith,Advanced
```

### results.csv
```csv
comp_id,comp_date,boulder_id,climber_id,attempts_to_zone,attempts_to_top,zone_completed,top_completed
1,2025-12-01,#1,C101,2,3,1,1
1,2025-12-01,#2,C101,5,0,1,0
```

## 🎯 Scoring Rules

- **Zone completed**: 50 points
- **Top completed**: 50 points (in addition to zone)
- **Maximum per boulder**: 100 points
- **Ranking**: By total points (desc), then attempts (asc), then name (alpha)

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Set up your Google Sheets** (see [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md))

3. **Update `config.js`** with your sheet URLs

4. **Run a local server:**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server
   ```

5. **Visit** `http://localhost:8000` in your browser

### Testing

The project includes comprehensive property-based tests:

```bash
npm install
npm test
```

Note: Tests are in the `archive/` folder and not deployed to production.

## 📝 Adding New Data

### Using Local CSV Files

1. **Add a new competition**: Add rows to `results.csv` with the new `comp_id`
2. **Add a new climber**: Add a row to `teams.csv`, then add their results to `results.csv`
3. **Add a new team**: Add rows to `teams.csv` for each team member
4. Refresh the dashboard to see updates

### Using Google Sheets

1. Edit your Google Sheet directly
2. Refresh the dashboard page (F5)
3. Changes appear immediately!

See [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md) for setup instructions.

## 🔧 Configuration

### Using Google Sheets (Recommended)

Edit `config.js`:
```javascript
const CONFIG = {
  dataSource: 'google-sheets',
  googleSheets: {
    teamsUrl: 'YOUR_PUBLISHED_TEAMS_URL',
    resultsUrl: 'YOUR_PUBLISHED_RESULTS_URL'
  }
};
```

See [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md) for detailed instructions.

### Using Local CSV Files

Edit `config.js`:
```javascript
const CONFIG = {
  dataSource: 'local',
  local: {
    teamsFile: 'teams.csv',
    resultsFile: 'results.csv'
  }
};
```

## 🔒 Privacy Note

If your Google Sheets contain sensitive data:
1. Uncomment `config.js` in `.gitignore`
2. Don't commit your actual `config.js`
3. Users can copy `config.example.js` to `config.js` and add their own URLs

## 📄 License

MIT License - feel free to use this for your own climbing competitions!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 🙏 Acknowledgments

- Built with vanilla JavaScript, no frameworks required!
- Property-based testing with fast-check
- Google Sheets integration for easy data management
