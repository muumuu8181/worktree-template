const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;
const MAX_TASKS = 50;
const MAX_TASK_LENGTH = 100;
const DATA_FILE = 'todo_results.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('src'));

// In-memory storage for todos
let todos = [];
let nextId = 1;

// Helper function to sanitize input (XSS prevention)
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Helper function to validate task
function validateTask(task) {
    if (!task || typeof task !== 'string') {
        return { valid: false, error: 'Invalid: Empty task' };
    }
    
    const trimmedTask = task.trim();
    if (trimmedTask.length === 0) {
        return { valid: false, error: 'Invalid: Empty task' };
    }
    
    if (trimmedTask.length > MAX_TASK_LENGTH) {
        return { valid: false, error: `Task exceeds ${MAX_TASK_LENGTH} characters` };
    }
    
    return { valid: true, task: trimmedTask };
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// GET /list - Get all todos
app.get('/list', (req, res) => {
    try {
        res.json({
            success: true,
            data: todos,
            count: todos.length
        });
    } catch (error) {
        console.error('Error in /list:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /add - Add new todo
app.post('/add', (req, res) => {
    try {
        const { task } = req.body;
        
        // Validate task
        const validation = validateTask(task);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        // Check for duplicates
        const sanitizedTask = sanitizeInput(validation.task);
        const isDuplicate = todos.some(todo => 
            todo.task.toLowerCase() === sanitizedTask.toLowerCase()
        );
        
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate task'
            });
        }
        
        // Check max tasks limit
        if (todos.length >= MAX_TASKS) {
            return res.status(400).json({
                success: false,
                error: 'Limit exceeded'
            });
        }
        
        // Add new todo
        const newTodo = {
            id: nextId++,
            task: sanitizedTask,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        
        res.json({
            success: true,
            data: newTodo
        });
    } catch (error) {
        console.error('Error in /add:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /edit - Edit existing todo
app.post('/edit', (req, res) => {
    try {
        const { id, task } = req.body;
        
        // Validate ID
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID'
            });
        }
        
        // Find todo
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        // Validate new task
        const validation = validateTask(task);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        const sanitizedTask = sanitizeInput(validation.task);
        
        // Check for duplicates (excluding current task)
        const isDuplicate = todos.some((todo, index) => 
            index !== todoIndex && 
            todo.task.toLowerCase() === sanitizedTask.toLowerCase()
        );
        
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate task'
            });
        }
        
        // Update todo
        todos[todoIndex].task = sanitizedTask;
        todos[todoIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            data: todos[todoIndex]
        });
    } catch (error) {
        console.error('Error in /edit:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /delete - Delete todo
app.post('/delete', (req, res) => {
    try {
        const { id } = req.body;
        
        // Validate ID
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID'
            });
        }
        
        // Find and remove todo
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        const deletedTodo = todos.splice(todoIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedTodo
        });
    } catch (error) {
        console.error('Error in /delete:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /toggle - Toggle todo completion status
app.post('/toggle', (req, res) => {
    try {
        const { id } = req.body;
        
        // Validate ID
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID'
            });
        }
        
        // Find todo
        const todo = todos.find(todo => todo.id === todoId);
        if (!todo) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        // Toggle completed status
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        console.error('Error in /toggle:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /save - Save todos to JSON file
app.post('/save', async (req, res) => {
    try {
        const data = {
            timestamp: new Date().toISOString(),
            totalTasks: todos.length,
            completedTasks: todos.filter(todo => todo.completed).length,
            incompleteTasks: todos.filter(todo => !todo.completed).length,
            tasks: todos
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Data saved successfully',
            filename: DATA_FILE
        });
    } catch (error) {
        console.error('Error in /save:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save data'
        });
    }
});

// GET /download - Download JSON file
app.get('/download', async (req, res) => {
    try {
        // Check if file exists
        try {
            await fs.access(DATA_FILE);
        } catch {
            // If file doesn't exist, create it with current data
            const data = {
                timestamp: new Date().toISOString(),
                totalTasks: todos.length,
                completedTasks: todos.filter(todo => todo.completed).length,
                incompleteTasks: todos.filter(todo => !todo.completed).length,
                tasks: todos
            };
            await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        }
        
        res.download(DATA_FILE, DATA_FILE, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({
                    success: false,
                    error: 'Failed to download file'
                });
            }
        });
    } catch (error) {
        console.error('Error in /download:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Todo List App server running on http://localhost:${PORT}`);
});