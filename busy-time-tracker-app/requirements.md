# Busy Time Tracker - Requirements Document

## Project Overview
This document outlines the complete requirements for the Busy Time Tracker application, a Node.js-based time tracking solution designed for busy professionals who need one-click activity recording with real-time timeline visualization.

## Technical Specifications

### Core Technology Stack
- **Backend**: Node.js v18+ with Express.js framework
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Dependencies**: Express.js only (minimal approach)
- **Data Storage**: 
  - Server version: In-memory (session-based)
  - Static version: localStorage for browser persistence
- **Deployment**: Dual deployment strategy
  - Local server version (port 3000)
  - GitHub Pages static version

### Architecture Requirements

#### Design Specifications (CSS Property Requirements)
**Critical Design Elements** (Externally Verifiable):
- Record buttons: **80px × 80px** (`.record-button { width: 80px; height: 80px; }`)
- Layout split: **Left 40%, Right 60%** (`.left-panel { width: 40%; }`, `.right-panel { width: 60%; }`)
- Button colors: **Default #4CAF50, Active #FF0000**
- Timeline background: **#f9f9f9**
- Button margins: **10px spacing**
- Font sizes: **Timeline 16px, Summary 24px**
- Container layout: **Flexbox with flex-direction: row**

#### Precision Requirements
- **Timestamp Accuracy**: Millisecond precision using `Date.now()`
- **Timer Updates**: 1-second intervals for live display
- **Duration Calculation**: Exact (End - Start) in milliseconds
- **Display Format**: HH:MM:SS for user-facing time values

## Functional Requirements

### Core Features

#### 1. Activity Recording
**One-Click Operation**:
- **Categories**: Work, Break, Meeting, Custom
- **Toggle Behavior**: Click to start, click again to stop
- **Visual Feedback**: Button color change (green → red when active)
- **Auto-Stop**: Starting new activity automatically stops current one

**Custom Activities**:
- Text input field (max 50 characters)
- Real-time character counter
- Enter key support for quick start
- Unicode text support (international characters)

#### 2. Real-Time Tracking
**Live Timer**:
- 1-second update intervals
- Persistent across page visibility changes
- HH:MM:SS format display
- Timeline integration with live updates

**Status Display**:
- Current activity indicator
- Running time display
- Ready/Running status messages

#### 3. Data Management
**Record Structure**:
```json
{
  "id": 1,
  "category": "Work",
  "start": 1743379200000,
  "end": 1743379260000,
  "duration": 60000
}
```

**Limitations**:
- Maximum 200 records per session
- Session-based storage (server version)
- localStorage persistence (static version)

#### 4. Timeline & Visualization
**Timeline Features**:
- Chronological display (newest first)
- Category filtering
- Running activity indicators
- Click-to-stop functionality
- Real-time duration updates

**Summary Statistics**:
- Total records count
- Running activities count
- Total time spent
- Category-wise breakdown
- Live calculation updates

#### 5. Data Export & Management
**JSON Export**:
- Complete activity data
- Metadata inclusion (export timestamp, totals)
- Browser download functionality
- Structured format for external analysis

**Data Operations**:
- Clear all records (with confirmation)
- Refresh/reload data
- Real-time synchronization

## API Specifications (Server Version)

### Endpoints
- `POST /start` - Start activity recording
- `POST /stop` - Stop activity by ID
- `GET /records` - Retrieve all records
- `GET /summary` - Get summary statistics
- `GET /download` - Export JSON file
- `POST /clear` - Clear all records
- `GET /health` - Server health check

### Error Handling
**Required Error Messages**:
- "Already running" - Duplicate activity start
- "Invalid: Empty custom activity" - Empty custom text
- "Limit exceeded" - 200+ records
- "Invalid: Record not found" - Invalid stop request

## User Experience Requirements

### Interface Specifications
**Layout Requirements**:
- Responsive design (desktop-first, mobile-adaptive)
- Left panel: Recording controls (40% width)
- Right panel: Timeline & summary (60% width)
- Header with app title and subtitle

**Interaction Design**:
- **Keyboard Shortcuts**:
  - `1-4`: Quick category selection
  - `Ctrl+E`: Export data
  - `Ctrl+R`: Refresh
  - `Enter`: Start custom activity
- **Visual Feedback**:
  - Button state changes
  - Loading indicators
  - Success/error messages
  - Hover effects

### Accessibility Requirements
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Clear focus indicators
- Descriptive labels and titles

## Performance Requirements

### Benchmarks
- **Page Load**: < 2 seconds
- **API Response**: < 100ms for standard operations
- **Memory Usage**: < 50MB with 100 records
- **Timer Accuracy**: < 1 second drift over 1 hour

### Scalability
- Handle up to 200 active records
- Smooth operation with rapid start/stop cycles
- Responsive UI with real-time updates
- Graceful degradation on slower devices

## Security Requirements

### Input Validation
- **XSS Prevention**: HTML/script tag sanitization
- **Length Limits**: 50 characters for custom activities
- **Type Validation**: Proper data type checking
- **SQL Injection**: N/A (no database, but input sanitization required)

### Data Protection
- No sensitive data storage
- Client-side only personal data
- localStorage security considerations
- No network data transmission (static version)

## Testing Requirements

### Test Coverage (100 Test Cases)
**Categories**:
- **Core Functionality** (30 tests): Start/stop, validation, edge cases
- **UI/UX** (20 tests): Interface interactions, visual feedback
- **Design Specification** (10 tests): CSS property verification
- **Data & API** (20 tests): Backend functionality, data integrity
- **Error Handling** (15 tests): Error scenarios, boundary conditions
- **Performance** (5 tests): Load time, memory usage, accuracy

### Test Data Examples
**Valid Inputs**:
- Categories: "Work", "Break", "Meeting", "Custom"
- Custom texts: "Code Review", "Coffee Break", "会議" (Unicode)
- Durations: 1ms to 24+ hours

**Invalid Inputs**:
- Empty strings, null values
- 51+ character custom text
- Script tags: `<script>alert('test')</script>`
- Invalid IDs: -1, "abc", null

### Verification Methods
- **Manual Testing**: User interface interactions
- **API Testing**: Curl/Postman endpoint verification
- **CSS Inspection**: Browser DevTools property checking
- **Automated Scripts**: Selenium/Playwright for UI automation
- **Performance Testing**: Load testing tools

## Deployment Requirements

### Server Version
**Local Development**:
```bash
npm install
npm start
# Access: http://localhost:3000
```

**Production Considerations**:
- Process management (PM2 recommended)
- Environment variable configuration
- Port configuration flexibility
- Graceful shutdown handling

### Static Version (GitHub Pages)
**Requirements**:
- Single HTML file with embedded CSS/JS
- localStorage data persistence
- Same UI/UX as server version
- No external dependencies
- Cross-browser compatibility

**Deployment Process**:
1. Create self-contained HTML file
2. Upload to GitHub Pages repository
3. Configure for subdirectory access
4. Test cross-browser functionality

## Documentation Requirements

### User Documentation
- **README.md**: Installation, usage, API documentation
- **Quick Start Guide**: 5-minute setup instructions
- **API Reference**: Complete endpoint documentation
- **Troubleshooting Guide**: Common issues and solutions

### Technical Documentation
- **Architecture Overview**: System design explanation
- **Code Documentation**: Inline comments for complex logic
- **Test Documentation**: Test case descriptions and execution
- **Deployment Guide**: Step-by-step deployment instructions

## Quality Assurance

### Code Quality Standards
- **ES6+ JavaScript**: Modern syntax usage
- **CSS3 Features**: Flexbox, Grid, animations
- **HTML5 Semantic**: Proper semantic markup
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Console logging for debugging

### Browser Support
- **Primary**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Fallbacks**: Graceful degradation for older browsers

## Success Criteria

### Functional Criteria
✅ All 100 test cases pass
✅ Real-time tracking with 1-second accuracy
✅ Data persistence (session/localStorage)
✅ Complete export functionality
✅ Responsive design implementation

### Performance Criteria
✅ Sub-2-second page load times
✅ Sub-100ms API response times
✅ Memory efficiency under 50MB
✅ Timer accuracy within 1-second drift

### Design Criteria
✅ Exact CSS specifications met
✅ 80px × 80px button dimensions
✅ 40/60 layout split maintained
✅ Color scheme compliance
✅ Typography specifications

### User Experience Criteria
✅ Intuitive one-click operation
✅ Clear visual feedback
✅ Keyboard shortcut support
✅ Mobile-responsive design
✅ Accessibility compliance

---

**Requirements Version**: 1.0.0  
**Last Updated**: 2025-07-29  
**Status**: ✅ Complete Implementation