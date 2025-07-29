# Busy Time Tracker - Test Cases (100 Items)

## Overview
This document contains 100 comprehensive test cases for the Busy Time Tracker application, covering functionality, design, performance, and edge cases.

---

## A. Core Functionality Tests (ID 1-30)

| ID | Test Case | Expected Result | Category | Priority |
|----|-----------|----------------|----------|----------|
| 1 | Start "Work" activity | Record created with start timestamp | Core | High |
| 2 | Start "Work" while already running "Work" | Error: "Already running" | Core | High |
| 3 | Stop running activity by ID | End timestamp set, duration calculated | Core | High |
| 4 | Start custom activity with empty text | Error: "Invalid: Empty custom activity" | Core | High |
| 5 | Create 201 records (exceed limit) | Error: "Limit exceeded" | Core | High |
| 6 | View summary after 2 records | Total duration and counts correct | Core | High |
| 7 | Start/Stop activity within 1 second | Duration approximately 1000ms | Core | High |
| 8 | Clear all records | Empty records array returned | Core | High |
| 9 | Start custom with script tag | Input sanitized, XSS prevented | Security | High |
| 10 | Export records as JSON | JSON file downloaded with correct data | Export | High |
| 11 | Start "Meeting" activity | Record added to timeline | Core | Medium |
| 12 | Stop non-existent record ID | Error: "Invalid: Record not found" | Error | Medium |
| 13 | Filter timeline by "Work" category | Only Work activities shown | UI | Medium |
| 14 | Start multiple different activities | Previous auto-stopped, new started | Core | Medium |
| 15 | Live timer updates during running activity | Timer increments every second | UI | Medium |
| 16 | Start Unicode custom activity (日本語) | Successfully recorded | I18n | Medium |
| 17 | View category breakdown in summary | Correct time totals per category | Summary | Medium |
| 18 | Run activity for 1 hour | Large duration correctly calculated | Performance | Low |
| 19 | Quick successive clicks (double-click) | Single action executed | UI | Medium |
| 20 | Console logs all operations | Proper log format maintained | Logging | Low |
| 21 | Start "Break" activity | Record created with correct category | Core | Medium |
| 22 | Stop activity via timeline click | Activity stopped successfully | UI | Medium |
| 23 | Refresh page with running activity | State preserved, timer continues | Persistence | High |
| 24 | Custom activity with 50 characters | Accepted (boundary test) | Validation | Medium |
| 25 | Custom activity with 51 characters | Rejected (boundary test) | Validation | Medium |
| 26 | Start activity with null category | Error handled gracefully | Error | Medium |
| 27 | Network failure during start | Error message displayed | Network | Medium |
| 28 | Start activity while offline | Appropriate error handling | Network | Low |
| 29 | API response timeout | Timeout handled gracefully | Network | Low |
| 30 | Malformed JSON response | Error parsing handled | Error | Low |

---

## B. UI/UX Tests (ID 31-50)

| ID | Test Case | Expected Result | Category | Priority |
|----|-----------|----------------|----------|----------|
| 31 | Click Work button | Button turns red (#FF0000) | UI | High |
| 32 | Stop running activity | Button returns to green (#4CAF50) | UI | High |
| 33 | Live timer displays in status | Real-time countdown shown | UI | High |
| 34 | Timeline shows running activity marker | "(Running)" text visible | UI | High |
| 35 | Success message appears on start | Green notification shown | UX | Medium |
| 36 | Error message appears on invalid action | Red notification shown | UX | Medium |
| 37 | Loading spinner during API calls | Loading overlay displayed | UX | Medium |
| 38 | Timeline scrolls with many entries | Scroll works properly | UI | Medium |
| 39 | Filter dropdown updates timeline | Content filtered correctly | UI | Medium |
| 40 | Character counter updates typing | Counter shows correct numbers | UI | Medium |
| 41 | Custom button disabled when empty | Button grayed out and unclickable | UI | Medium |
| 42 | Hover effects on buttons | Visual feedback provided | UX | Low |
| 43 | Timeline entries hover highlighting | Row highlights on hover | UI | Low |
| 44 | Responsive design on mobile | Layout adapts properly | Responsive | Medium |
| 45 | Keyboard shortcuts work (Ctrl+E) | Export triggered by shortcut | Accessibility | Medium |
| 46 | Number keys select categories | 1=Work, 2=Break, 3=Meeting, 4=Custom | Accessibility | Medium |
| 47 | Tab navigation works | Proper tab order maintained | Accessibility | Medium |
| 48 | Enter key starts custom activity | Input field accepts Enter | UX | Medium |
| 49 | Message auto-dismiss after 5 seconds | Notifications disappear automatically | UX | Low |
| 50 | Click message to dismiss | Manual dismiss works | UX | Low |

---

## C. Design Specification Tests (ID 51-60)

| ID | Test Case | Expected CSS Value | Verification Method | Priority |
|----|-----------|-------------------|-------------------|----------|
| 51 | Record button width | 80px | .record-button { width: 80px } | High |
| 52 | Record button height | 80px | .record-button { height: 80px } | High |
| 53 | Left panel width | 40% | .left-panel { width: 40% } | High |
| 54 | Right panel width | 60% | .right-panel { width: 60% } | High |
| 55 | Button background color | #4CAF50 | .record-button { background: #4CAF50 } | High |
| 56 | Active button background | #FF0000 | .record-button.active { background: #FF0000 } | High |
| 57 | Timeline background | #f9f9f9 | .right-panel { background: #f9f9f9 } | High |
| 58 | Button margin | 10px | .record-button { margin: 10px } | Medium |
| 59 | Timeline font size | 16px | .timeline li { font-size: 16px } | Medium |
| 60 | Summary font size | 24px | .stat-value { font-size: 24px } | Medium |

---

## D. Data & API Tests (ID 61-80)

| ID | Test Case | Expected Result | Category | Priority |
|----|-----------|----------------|----------|----------|
| 61 | POST /start with valid data | 200 status, record returned | API | High |
| 62 | POST /start with invalid category | 400 error response | API | High |
| 63 | POST /stop with valid ID | 200 status, updated record | API | High |
| 64 | POST /stop with invalid ID | 404 error response | API | High |
| 65 | GET /records | All records returned | API | High |
| 66 | GET /summary | Correct totals calculated | API | High |
| 67 | GET /download | JSON file generated | API | High |
| 68 | POST /clear | All records deleted | API | Medium |
| 69 | GET /health | Health status returned | API | Low |
| 70 | Record ID increments correctly | Sequential IDs: 1, 2, 3... | Data | Medium |
| 71 | Timestamp precision (milliseconds) | Exact timestamp recorded | Data | High |
| 72 | Duration calculation accuracy | End - Start = Duration | Data | High |
| 73 | Category preservation | Original category maintained | Data | Medium |
| 74 | Custom text preservation | Original text maintained | Data | Medium |
| 75 | Summary totals accuracy | Sum of all durations matches | Data | High |
| 76 | Category breakdown accuracy | Per-category totals correct | Data | Medium |
| 77 | Running record detection | Null end time identifies running | Data | Medium |
| 78 | JSON export structure | Proper JSON format | Export | Medium |
| 79 | JSON export completeness | All records included | Export | Medium |
| 80 | JSON export metadata | Export timestamp included | Export | Low |

---

## E. Error Handling & Edge Cases (ID 81-95)

| ID | Test Case | Expected Result | Category | Priority |
|----|-----------|----------------|----------|----------|
| 81 | Start activity with null payload | 400 error, proper message | Error | High |
| 82 | Server restart during activity | Graceful degradation | Reliability | Medium |
| 83 | Browser refresh during API call | Request handling maintained | Reliability | Medium |
| 84 | Network timeout (slow connection) | Timeout error displayed | Network | Medium |
| 85 | Invalid JSON in request | 400 error response | Validation | Medium |
| 86 | Very long custom activity name (1000 chars) | Rejected with error | Validation | Medium |
| 87 | Negative timestamp values | Handled gracefully | Edge Case | Low |
| 88 | Unicode emoji in custom text | Properly stored and displayed | I18n | Medium |
| 89 | Concurrent start requests | Race condition handled | Concurrency | Medium |
| 90 | Memory pressure (1000+ records) | Performance maintained | Performance | Low |
| 91 | Page hidden/visible tab switching | Timer behavior correct | Lifecycle | Medium |
| 92 | Browser back/forward navigation | State preserved correctly | Navigation | Medium |
| 93 | Right-click context menu | Standard browser behavior | UX | Low |
| 94 | Copy/paste in custom input | Standard input behavior | UX | Low |
| 95 | Drag and drop interactions | No unintended behavior | UX | Low |

---

## F. Performance & Integration Tests (ID 96-100)

| ID | Test Case | Expected Result | Category | Priority |
|----|-----------|----------------|----------|----------|
| 96 | Page load time | < 2 seconds on standard connection | Performance | Medium |
| 97 | API response time | < 100ms for standard operations | Performance | High |
| 98 | Memory usage with 100 records | < 50MB total memory | Performance | Medium |
| 99 | Timer accuracy over 1 hour | < 1 second drift | Accuracy | Medium |
| 100 | Full workflow: Start→Stop→Export | Complete process successful | Integration | High |

---

## Test Execution Summary Template

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Pass | 0 | 0% |
| ❌ Fail | 0 | 0% |
| ⏸️ Skip | 0 | 0% |
| 🔄 Pending | 100 | 100% |

### Test Categories Breakdown
- **Core Functionality**: 30 tests (ID 1-30)
- **UI/UX**: 20 tests (ID 31-50)  
- **Design Specification**: 10 tests (ID 51-60)
- **Data & API**: 20 tests (ID 61-80)
- **Error Handling**: 15 tests (ID 81-95)
- **Performance**: 5 tests (ID 96-100)

### Priority Distribution
- **High Priority**: 45 tests
- **Medium Priority**: 45 tests  
- **Low Priority**: 10 tests

---

## Automated Testing Notes

These test cases can be executed through:

1. **Manual Testing**: UI interactions and visual verification
2. **API Testing**: Using tools like Postman or curl
3. **CSS Verification**: Browser DevTools element inspection
4. **Automated Scripts**: Selenium/Playwright for UI automation
5. **Load Testing**: Artillery or similar tools for performance

---

## Test Data Examples

### Valid Test Data
- Categories: "Work", "Break", "Meeting", "Custom"
- Custom texts: "Code Review", "Coffee Break", "Planning Session"
- Unicode: "会議", "コーヒー", "작업"

### Invalid Test Data  
- Empty strings: "", null, undefined
- Long strings: 51+ character texts
- Special characters: `<script>`, `${code}`, SQL injection attempts
- Invalid IDs: -1, 0, 99999, "abc", null

### Boundary Test Data
- Exactly 50 characters: "This is exactly fifty characters long for testing"
- Exactly 200 records: Generate 200 sequential records
- Millisecond precision: Timestamps with exact millisecond values

---

*Generated for Busy Time Tracker v1.0*  
*Test cases designed to ensure 100% functionality coverage*