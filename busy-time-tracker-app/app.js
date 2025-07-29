const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const MAX_RECORDS = 200;

// Data storage (in-memory for session)
let records = [];
let nextId = 1;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// Utility functions
function logOperation(type, category, timestamp, status, details = '') {
    console.log(`Operation: ${type}, Category: ${category}, Timestamp: ${timestamp}, Result: ${status}${details ? ', Details: ' + details : ''}`);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    // Basic XSS prevention - remove script tags and dangerous characters
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/[<>'"]/g, '')
                .trim();
}

function validateCategory(category) {
    const validCategories = ['Work', 'Break', 'Meeting', 'Custom'];
    return validCategories.includes(category) || (category && category.startsWith('Custom:'));
}

function getRunningRecord() {
    return records.find(record => record.end === null);
}

function calculateDuration(startTime, endTime = Date.now()) {
    return endTime - startTime;
}

function generateSummary() {
    const categoryTotals = {};
    let totalDuration = 0;

    records.forEach(record => {
        if (record.end !== null) {
            const duration = record.duration;
            const category = record.category.startsWith('Custom:') ? 'Custom' : record.category;
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += duration;
            totalDuration += duration;
        }
    });

    return {
        totalRecords: records.length,
        completedRecords: records.filter(r => r.end !== null).length,
        runningRecords: records.filter(r => r.end === null).length,
        totalDuration,
        categoryTotals,
        lastUpdated: Date.now()
    };
}

// API Routes

// Start activity
app.post('/start', (req, res) => {
    try {
        const { category } = req.body;
        const timestamp = Date.now();
        
        // Input validation
        if (!category) {
            logOperation('START', 'undefined', timestamp, 'ERROR', 'Missing category');
            return res.status(400).json({ error: 'Category is required' });
        }

        const sanitizedCategory = sanitizeInput(category);
        
        // Custom category validation
        if (category === 'Custom' && (!req.body.customText || !req.body.customText.trim())) {
            logOperation('START', category, timestamp, 'ERROR', 'Empty custom activity');
            return res.status(400).json({ error: 'Invalid: Empty custom activity' });
        }

        let finalCategory = sanitizedCategory;
        if (category === 'Custom' && req.body.customText) {
            const customText = sanitizeInput(req.body.customText);
            if (customText.length > 50) {
                logOperation('START', category, timestamp, 'ERROR', 'Custom text too long');
                return res.status(400).json({ error: 'Custom text must be 50 characters or less' });
            }
            finalCategory = `Custom: ${customText}`;
        }

        // Check for duplicate running activity
        const runningRecord = getRunningRecord();
        if (runningRecord && runningRecord.category === finalCategory) {
            logOperation('START', finalCategory, timestamp, 'ERROR', 'Already running');
            return res.status(400).json({ error: 'Already running' });
        }

        // Check record limit
        if (records.length >= MAX_RECORDS) {
            logOperation('START', finalCategory, timestamp, 'ERROR', 'Limit exceeded');
            return res.status(400).json({ error: 'Limit exceeded' });
        }

        // Stop any currently running activity
        if (runningRecord) {
            runningRecord.end = timestamp;
            runningRecord.duration = calculateDuration(runningRecord.start, timestamp);
            logOperation('STOP', runningRecord.category, timestamp, 'SUCCESS', 'Auto-stopped for new activity');
        }

        // Create new record
        const newRecord = {
            id: nextId++,
            category: finalCategory,
            start: timestamp,
            end: null,
            duration: 0
        };

        records.push(newRecord);
        logOperation('START', finalCategory, timestamp, 'SUCCESS');

        res.json({
            success: true,
            record: newRecord,
            records: records,
            summary: generateSummary()
        });

    } catch (error) {
        console.error('Start error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stop activity
app.post('/stop', (req, res) => {
    try {
        const { id } = req.body;
        const timestamp = Date.now();

        // Find record
        const record = records.find(r => r.id === id);
        if (!record) {
            logOperation('STOP', 'unknown', timestamp, 'ERROR', 'Record not found');
            return res.status(404).json({ error: 'Invalid: Record not found' });
        }

        if (record.end !== null) {
            logOperation('STOP', record.category, timestamp, 'ERROR', 'Already stopped');
            return res.status(400).json({ error: 'Activity already stopped' });
        }

        // Stop the record
        record.end = timestamp;
        record.duration = calculateDuration(record.start, timestamp);
        
        logOperation('STOP', record.category, timestamp, 'SUCCESS', `Duration: ${record.duration}ms`);

        res.json({
            success: true,
            record: record,
            records: records,
            summary: generateSummary()
        });

    } catch (error) {
        console.error('Stop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all records
app.get('/records', (req, res) => {
    try {
        res.json({
            records: records,
            count: records.length,
            running: getRunningRecord(),
            lastUpdated: Date.now()
        });
    } catch (error) {
        console.error('Records error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get summary
app.get('/summary', (req, res) => {
    try {
        res.json(generateSummary());
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Download JSON file
app.get('/download', (req, res) => {
    try {
        const filename = './time_records.json';
        const exportData = {
            exportedAt: Date.now(),
            exportedAtFormatted: new Date().toISOString(),
            totalRecords: records.length,
            records: records,
            summary: generateSummary()
        };

        // Write to file
        fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
        
        console.log(`Records exported to ${filename}`);
        
        // Send file for download
        res.download(filename, 'time_records.json', (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ error: 'Download failed' });
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

// Clear all records
app.post('/clear', (req, res) => {
    try {
        const timestamp = Date.now();
        const recordCount = records.length;
        
        records = [];
        nextId = 1;
        
        logOperation('CLEAR', 'all', timestamp, 'SUCCESS', `Cleared ${recordCount} records`);
        
        res.json({
            success: true,
            message: `Cleared ${recordCount} records`,
            records: records,
            summary: generateSummary()
        });

    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: 'Clear failed' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        memory: process.memoryUsage(),
        records: records.length
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Busy Time Tracker server running on http://localhost:${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  POST /start - Start activity`);
    console.log(`  POST /stop - Stop activity`);
    console.log(`  GET /records - Get all records`);
    console.log(`  GET /summary - Get summary`);
    console.log(`  GET /download - Download JSON`);
    console.log(`  POST /clear - Clear all records`);
    console.log(`  GET /health - Health check`);
});

module.exports = app;