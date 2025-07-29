// Busy Time Tracker - Frontend JavaScript
// Author: Busy Time Tracker Team
// Description: Client-side functionality for time tracking application

class BusyTimeTracker {
    constructor() {
        this.records = [];
        this.currentRecord = null;
        this.timerInterval = null;
        this.refreshInterval = null;
        this.lastUpdateTime = 0;
        
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.startPeriodicRefresh();
        this.loadData();
        this.updateCustomButtonState();
        
        console.log('Busy Time Tracker initialized');
    }

    // Bind all event listeners
    bindEvents() {
        // Category buttons
        document.querySelectorAll('.record-button[data-category]').forEach(button => {
            button.addEventListener('click', (e) => this.handleCategoryButton(e));
        });

        // Custom text input
        const customText = document.getElementById('custom-text');
        const startCustomBtn = document.getElementById('start-custom');
        
        customText.addEventListener('input', () => this.updateCustomButtonState());
        customText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !startCustomBtn.disabled) {
                this.handleCustomStart();
            }
        });

        startCustomBtn.addEventListener('click', () => this.handleCustomStart());

        // Control buttons
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAllData());
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadData());

        // Filter dropdown
        document.getElementById('filter-category').addEventListener('change', () => this.updateTimeline());

        // Character counter
        customText.addEventListener('input', () => this.updateCharacterCount());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    this.exportData();
                    break;
                case 'r':
                    e.preventDefault();
                    this.loadData();
                    break;
                case 'Delete':
                    e.preventDefault();
                    this.clearAllData();
                    break;
            }
        }

        // Number keys for quick category selection
        if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
            const buttons = document.querySelectorAll('.record-button[data-category]');
            const index = parseInt(e.key) - 1;
            if (buttons[index]) {
                buttons[index].click();
            }
        }
    }

    // Update character count display
    updateCharacterCount() {
        const customText = document.getElementById('custom-text');
        const charCount = document.getElementById('char-count');
        const count = customText.value.length;
        
        charCount.textContent = count;
        charCount.style.color = count > 40 ? '#ff5722' : '#666';
    }

    // Update custom button state based on input
    updateCustomButtonState() {
        const customText = document.getElementById('custom-text');
        const startCustomBtn = document.getElementById('start-custom');
        const hasText = customText.value.trim().length > 0;
        
        startCustomBtn.disabled = !hasText;
        startCustomBtn.style.opacity = hasText ? '1' : '0.6';
    }

    // Handle category button clicks
    async handleCategoryButton(e) {
        const button = e.currentTarget;
        const category = button.dataset.category;
        const isActive = button.classList.contains('active');

        try {
            if (isActive && this.currentRecord && this.currentRecord.category === category) {
                // Stop current activity
                await this.stopActivity(this.currentRecord.id);
            } else {
                // Start new activity
                await this.startActivity(category);
            }
        } catch (error) {
            this.showMessage('Error processing request: ' + error.message, 'error');
        }
    }

    // Handle custom activity start
    async handleCustomStart() {
        const customText = document.getElementById('custom-text');
        const text = customText.value.trim();
        
        if (!text) {
            this.showMessage('Please enter a custom activity name', 'error');
            return;
        }

        try {
            await this.startActivity('Custom', text);
            customText.value = '';
            this.updateCustomButtonState();
            this.updateCharacterCount();
        } catch (error) {
            this.showMessage('Error starting custom activity: ' + error.message, 'error');
        }
    }

    // Start an activity
    async startActivity(category, customText = '') {
        this.showLoading(true);
        
        try {
            const payload = { category };
            if (category === 'Custom' && customText) {
                payload.customText = customText;
            }

            const response = await fetch('/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start activity');
            }

            this.records = data.records;
            this.currentRecord = data.record;
            this.updateUI();
            this.startLiveTimer();
            
            const displayCategory = category === 'Custom' ? `Custom: ${customText}` : category;
            this.showMessage(`Started ${displayCategory}`, 'success');

        } catch (error) {
            console.error('Start activity error:', error);
            this.showMessage(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Stop an activity
    async stopActivity(id) {
        this.showLoading(true);
        
        try {
            const response = await fetch('/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to stop activity');
            }

            this.records = data.records;
            this.currentRecord = null;
            this.stopLiveTimer();
            this.updateUI();
            
            this.showMessage('Activity stopped', 'success');

        } catch (error) {
            console.error('Stop activity error:', error);
            this.showMessage(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Load data from server
    async loadData() {
        try {
            const [recordsResponse, summaryResponse] = await Promise.all([
                fetch('/records'),
                fetch('/summary')
            ]);

            if (!recordsResponse.ok || !summaryResponse.ok) {
                throw new Error('Failed to load data');
            }

            const recordsData = await recordsResponse.json();
            const summaryData = await summaryResponse.json();

            this.records = recordsData.records;
            this.currentRecord = recordsData.running;
            this.lastUpdateTime = Date.now();

            this.updateUI();
            this.updateSummary(summaryData);
            
            // Start/restart live timer if there's a running activity
            if (this.currentRecord) {
                this.startLiveTimer();
            } else {
                this.stopLiveTimer();
            }

        } catch (error) {
            console.error('Load data error:', error);
            this.showMessage('Failed to load data: ' + error.message, 'error');
        }
    }

    // Update the entire UI
    updateUI() {
        this.updateButtons();
        this.updateTimeline();
        this.updateStatus();
    }

    // Update button states
    updateButtons() {
        document.querySelectorAll('.record-button[data-category]').forEach(button => {
            const category = button.dataset.category;
            const isRunning = this.currentRecord && 
                (this.currentRecord.category === category || 
                 (category === 'Custom' && this.currentRecord.category.startsWith('Custom:')));
            
            button.classList.toggle('active', isRunning);
        });
    }

    // Update status display
    updateStatus() {
        const statusText = document.getElementById('status-text');
        const liveTimer = document.getElementById('live-timer');

        if (this.currentRecord) {
            statusText.textContent = `Running: ${this.currentRecord.category}`;
            statusText.style.color = '#ff5722';
        } else {
            statusText.textContent = 'Ready to track';
            statusText.style.color = '#2e7d32';
            liveTimer.textContent = '';
        }
    }

    // Start live timer
    startLiveTimer() {
        this.stopLiveTimer(); // Clear any existing timer
        
        if (!this.currentRecord) return;

        this.timerInterval = setInterval(() => {
            if (this.currentRecord) {
                const elapsed = Date.now() - this.currentRecord.start;
                const liveTimer = document.getElementById('live-timer');
                liveTimer.textContent = this.formatDuration(elapsed);
                
                // Also update the timeline entry for the running activity
                this.updateRunningTimelineEntry();
            }
        }, 1000);
    }

    // Stop live timer
    stopLiveTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Update running timeline entry
    updateRunningTimelineEntry() {
        if (!this.currentRecord) return;

        const timelineEntry = document.querySelector(`[data-record-id="${this.currentRecord.id}"] .timeline-duration`);
        if (timelineEntry) {
            const elapsed = Date.now() - this.currentRecord.start;
            timelineEntry.textContent = this.formatDuration(elapsed);
        }
    }

    // Update timeline display
    updateTimeline() {
        const timeline = document.getElementById('timeline');
        const filter = document.getElementById('filter-category').value;
        
        // Filter records
        let filteredRecords = this.records;
        if (filter) {
            filteredRecords = this.records.filter(record => {
                if (filter === 'Custom') {
                    return record.category.startsWith('Custom:');
                }
                return record.category === filter;
            });
        }

        // Sort by start time (newest first)
        filteredRecords.sort((a, b) => b.start - a.start);

        // Clear timeline
        timeline.innerHTML = '';

        if (filteredRecords.length === 0) {
            timeline.innerHTML = `
                <li class="timeline-empty">
                    <span class="empty-message">No activities found${filter ? ' for selected category' : ''}.</span>
                </li>
            `;
            return;
        }

        // Add timeline entries
        filteredRecords.forEach(record => {
            const li = document.createElement('li');
            li.setAttribute('data-record-id', record.id);
            
            const isRunning = record.end === null;
            const duration = isRunning ? Date.now() - record.start : record.duration;
            
            li.innerHTML = `
                <div class="timeline-entry">
                    <div class="timeline-info">
                        <div class="timeline-category ${isRunning ? 'running' : ''}">
                            ${record.category} ${isRunning ? '(Running)' : ''}
                        </div>
                        <div class="timeline-times">
                            Started: ${this.formatTime(record.start)} ${record.end ? '| Ended: ' + this.formatTime(record.end) : ''}
                        </div>
                    </div>
                    <div class="timeline-duration ${isRunning ? 'running' : ''}">
                        ${this.formatDuration(duration)}
                    </div>
                </div>
            `;

            // Add click handler for running activities (to stop them)
            if (isRunning) {
                li.style.cursor = 'pointer';
                li.title = 'Click to stop this activity';
                li.addEventListener('click', () => this.stopActivity(record.id));
            }

            timeline.appendChild(li);
        });
    }

    // Update summary display
    updateSummary(summaryData) {
        document.getElementById('total-records').textContent = summaryData.totalRecords;
        document.getElementById('running-count').textContent = summaryData.runningRecords;
        document.getElementById('total-time').textContent = this.formatDuration(summaryData.totalDuration);

        // Update category breakdown
        const breakdown = document.getElementById('category-breakdown');
        breakdown.innerHTML = '';

        if (summaryData.categoryTotals && Object.keys(summaryData.categoryTotals).length > 0) {
            Object.entries(summaryData.categoryTotals).forEach(([category, duration]) => {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = `
                    <span class="category-name">${category}</span>
                    <span class="category-time">${this.formatDuration(duration)}</span>
                `;
                breakdown.appendChild(div);
            });
        } else {
            breakdown.innerHTML = '<div class="category-item"><span class="category-name">No completed activities yet</span></div>';
        }
    }

    // Export data as JSON
    async exportData() {
        try {
            this.showLoading(true);
            
            // Trigger download from server
            const link = document.createElement('a');
            link.href = '/download';
            link.download = 'time_records.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('Data exported successfully', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Export failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Clear all data
    async clearAllData() {
        if (!confirm('Are you sure you want to clear all recorded data? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch('/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to clear data');
            }

            this.records = [];
            this.currentRecord = null;
            this.stopLiveTimer();
            this.updateUI();
            this.updateSummary({ totalRecords: 0, runningRecords: 0, totalDuration: 0, categoryTotals: {} });
            
            this.showMessage('All data cleared', 'success');

        } catch (error) {
            console.error('Clear data error:', error);
            this.showMessage('Failed to clear data: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Start periodic refresh
    startPeriodicRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
    }

    // Format timestamp to readable time
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    // Format duration in milliseconds to HH:MM:SS
    formatDuration(ms) {
        if (ms < 0) ms = 0;
        
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Show status message
    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);

        // Add click to dismiss
        messageEl.addEventListener('click', () => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        });
    }

    // Show/hide loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    // Cleanup on page unload
    destroy() {
        this.stopLiveTimer();
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.busyTimeTracker = new BusyTimeTracker();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.busyTimeTracker) {
        window.busyTimeTracker.destroy();
    }
});

// Handle visibility change (pause/resume timers when tab is hidden/visible)
document.addEventListener('visibilitychange', () => {
    if (window.busyTimeTracker) {
        if (document.hidden) {
            // Page is hidden, could pause some updates
            console.log('Page hidden, reducing update frequency');
        } else {
            // Page is visible again, refresh data
            console.log('Page visible, refreshing data');
            window.busyTimeTracker.loadData();
        }
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BusyTimeTracker;
}