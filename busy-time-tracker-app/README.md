# 🕐 Busy Time Tracker

A Node.js-based time tracking application designed for busy professionals who need one-click activity recording with real-time timeline visualization and comprehensive reporting.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ Features

### 🎯 Core Functionality
- **One-Click Recording**: Start and stop activities with a single button click
- **Real-Time Tracking**: Live timer displays current activity duration
- **Multiple Categories**: Pre-defined categories (Work, Break, Meeting) + Custom activities
- **Millisecond Precision**: Accurate time tracking with timestamp precision
- **Timeline View**: Chronological display of all recorded activities
- **Summary Reports**: Category-wise time breakdown and totals

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Visual Feedback**: Color-coded buttons and real-time status indicators
- **Keyboard Shortcuts**: Quick access via hotkeys (Ctrl+E for export, 1-4 for categories)
- **Auto-Refresh**: Periodic data synchronization every 30 seconds
- **Offline Handling**: Graceful error handling for network issues

### 📊 Data Management
- **JSON Export**: Download complete activity data in structured format
- **Data Validation**: Input sanitization and XSS prevention
- **Memory Efficient**: Optimized for handling up to 200 activity records
- **Session-Based**: In-memory storage for current session (no database required)

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd busy-time-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Alternative: Direct Setup
```bash
# Quick setup script
mkdir busy-time-tracker-app && cd busy-time-tracker-app
npm init -y
npm install express
# Copy app.js and src/ folder to current directory
node app.js
```

## 📖 Usage Guide

### Basic Operations

#### Starting an Activity
1. **Pre-defined Categories**: Click on Work, Break, or Meeting buttons
2. **Custom Activities**: 
   - Type activity name in the custom input field (max 50 characters)
   - Click the "Start" button or press Enter

#### Stopping an Activity
- Click the same category button again (it will be red/active)
- Click on the running activity in the timeline
- Start a different activity (auto-stops the current one)

#### Managing Data
- **Export**: Click "Export JSON" to download activity data
- **Clear All**: Click "Clear All" to reset all recorded data (requires confirmation)
- **Refresh**: Click "Refresh" to sync with server data

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `1` | Start/Stop Work |
| `2` | Start/Stop Break |
| `3` | Start/Stop Meeting |
| `4` | Focus Custom Input |
| `Ctrl+E` | Export Data |
| `Ctrl+R` | Refresh Data |
| `Ctrl+Delete` | Clear All Data |
| `Enter` | Start Custom Activity (when input focused) |

### Timeline Features
- **Filtering**: Use the dropdown to filter by category
- **Real-Time Updates**: Running activities show live duration
- **Click to Stop**: Click any running activity to stop it
- **Sorting**: Activities displayed chronologically (newest first)

## 🔧 API Documentation

### Endpoints

#### `POST /start`
Start a new activity
```json
{
  "category": "Work",
  "customText": "Optional custom text for Custom category"
}
```

**Response:**
```json
{
  "success": true,
  "record": {
    "id": 1,
    "category": "Work",
    "start": 1743379200000,
    "end": null,
    "duration": 0
  },
  "records": [...],
  "summary": {...}
}
```

#### `POST /stop`
Stop a running activity
```json
{
  "id": 1
}
```

#### `GET /records`
Get all activity records
```json
{
  "records": [...],
  "count": 5,
  "running": {...},
  "lastUpdated": 1743379200000
}
```

#### `GET /summary`
Get summary statistics
```json
{
  "totalRecords": 5,
  "completedRecords": 4,
  "runningRecords": 1,
  "totalDuration": 3600000,
  "categoryTotals": {
    "Work": 2400000,
    "Break": 600000,
    "Meeting": 600000
  },
  "lastUpdated": 1743379200000
}
```

#### `GET /download`
Download activity data as JSON file

#### `POST /clear`
Clear all activity data

#### `GET /health`
Health check endpoint

### Error Responses
```json
{
  "error": "Error message description"
}
```

Common errors:
- `"Already running"` - Attempting to start duplicate activity
- `"Invalid: Empty custom activity"` - Custom activity without text
- `"Limit exceeded"` - More than 200 records
- `"Invalid: Record not found"` - Invalid record ID for stopping

## 🗂️ Project Structure

```
busy-time-tracker-app/
├── package.json          # Project configuration and dependencies
├── app.js                # Express server and API endpoints
├── src/                  # Frontend assets
│   ├── index.html       # Main application interface
│   ├── styles.css       # Styling and layout
│   └── script.js        # Frontend JavaScript logic
├── test-cases.md        # Comprehensive test suite (100 tests)
├── README.md            # This documentation
└── time_records.json    # Generated export file (created on export)
```

## 🧪 Testing

### Running Tests

The application includes 100 comprehensive test cases covering:
- **Core Functionality** (30 tests): Start/stop activities, data validation
- **UI/UX** (20 tests): User interface interactions and feedback
- **Design Specification** (10 tests): CSS property verification
- **Data & API** (20 tests): Backend functionality and data integrity
- **Error Handling** (15 tests): Edge cases and error scenarios
- **Performance** (5 tests): Load time and memory usage

### Manual Testing
1. Open application in browser
2. Test each category button (Work, Break, Meeting, Custom)
3. Verify timeline updates and summary calculations
4. Test export and clear functionality
5. Verify responsive design on different screen sizes

### API Testing with curl
```bash
# Start Work activity
curl -X POST http://localhost:3000/start \
  -H "Content-Type: application/json" \
  -d '{"category":"Work"}'

# Get current records
curl http://localhost:3000/records

# Get summary
curl http://localhost:3000/summary

# Stop activity (replace ID)
curl -X POST http://localhost:3000/stop \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

### Performance Benchmarks
- **Page Load**: < 2 seconds
- **API Response**: < 100ms for standard operations
- **Memory Usage**: < 50MB with 100 records
- **Timer Accuracy**: < 1 second drift over 1 hour

## 🌐 GitHub Pages Deployment

### Prerequisites
```bash
npm install -g gh-pages
```

### Deployment Steps

1. **Prepare static version** (for GitHub Pages):
   ```bash
   # Create a static version using localStorage instead of server
   cp src/index.html docs/index.html
   cp src/styles.css docs/styles.css
   # Modify script.js to use localStorage instead of API calls
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

3. **Access your deployed app**:
   ```
   https://yourusername.github.io/busy-time-tracker-app/
   ```

### Static Version Notes
For GitHub Pages compatibility, a static version can be created that uses:
- **localStorage** for data persistence
- **Client-side only** JavaScript (no server required)
- **Same UI/UX** as the full server version

## ⚙️ Configuration

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment mode
MAX_RECORDS=200             # Maximum activity records
```

### Customization Options

#### Categories
Edit `app.js` to modify available categories:
```javascript
const validCategories = ['Work', 'Break', 'Meeting', 'Custom'];
```

#### Styling
Modify `src/styles.css` to change appearance:
```css
.record-button {
  width: 80px;               /* Button size */
  height: 80px;
  background: #4CAF50;       /* Default color */
  margin: 10px;              /* Spacing */
}

.record-button.active {
  background: #FF0000;       /* Active color */
}
```

#### Timer Intervals
Adjust update frequencies in `src/script.js`:
```javascript
// Live timer update (default: 1 second)
this.timerInterval = setInterval(() => {...}, 1000);

// Data refresh (default: 30 seconds)
this.refreshInterval = setInterval(() => {...}, 30000);
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server with nodemon (if installed)
npx nodemon app.js

# Or start normally
npm start
```

### Code Structure

#### Backend (`app.js`)
- Express server setup
- API route handlers
- Data validation and sanitization
- Error handling middleware
- Logging utilities

#### Frontend (`src/script.js`)
- BusyTimeTracker class
- Event handlers for UI interactions
- API communication functions
- Real-time timer management
- DOM manipulation and updates

#### Styling (`src/styles.css`)
- Responsive flexbox layout
- Color scheme and theming
- Animation and transitions
- Mobile-first design approach

### Adding New Features

1. **New Category**: Add to `validCategories` array and update UI
2. **Additional API Endpoints**: Add route handlers in `app.js`
3. **UI Enhancements**: Modify HTML structure and CSS styling
4. **New Functionality**: Extend BusyTimeTracker class methods

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check port availability
netstat -an | grep 3000
```

#### Data Not Saving
- **Issue**: Data disappears on server restart
- **Explanation**: This is expected behavior (in-memory storage)
- **Solution**: Use export function before stopping server

#### UI Not Loading
- Ensure all files are in correct locations:
  - `src/index.html`
  - `src/styles.css`
  - `src/script.js`
- Check browser console for JavaScript errors
- Verify server is serving static files correctly

#### Timer Accuracy Issues
- **Browser Tab Hidden**: Timers may slow down when tab is inactive
- **System Clock Changes**: May affect duration calculations
- **Solution**: Use server-side timestamps for critical timing

### Debug Mode
Enable detailed logging:
```javascript
// In app.js, set verbose logging
const DEBUG = true;

// In browser console
localStorage.setItem('debug', 'true');
```

## 📋 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Core time tracking functionality
- ✅ Real-time UI updates
- ✅ JSON export capability
- ✅ Responsive design
- ✅ Comprehensive test suite
- ✅ Full documentation

### Planned Features
- 🔄 Data persistence (database integration)
- 🔄 Multiple user support
- 🔄 Advanced reporting and analytics
- 🔄 Time goals and notifications
- 🔄 Integration with external calendars

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web application framework
- **Modern CSS** - Flexbox and Grid layouts
- **Vanilla JavaScript** - No external frontend frameworks
- **Node.js** - Server runtime environment

---

## 📞 Support

For issues, questions, or feature requests:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include system information and steps to reproduce

**Happy Time Tracking! ⏰**