// Global variables
let todos = [];
let editingId = null;

// DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const taskCount = document.getElementById('taskCount');
const completedCount = document.getElementById('completedCount');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    saveBtn.addEventListener('click', saveTodos);
    downloadBtn.addEventListener('click', downloadTodos);
    updateBtn.addEventListener('click', updateTask);
    cancelBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Load todos from server
async function loadTodos() {
    try {
        const response = await fetch('/list');
        const result = await response.json();
        
        if (result.success) {
            todos = result.data;
            renderTodos();
            updateCounters();
        } else {
            showError('Failed to load tasks');
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to connect to server');
    }
}

// Add new task
async function addTask() {
    const task = taskInput.value.trim();
    
    if (!task) {
        showError('Invalid: Empty task');
        return;
    }
    
    try {
        const response = await fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task })
        });
        
        const result = await response.json();
        
        if (result.success) {
            taskInput.value = '';
            clearError();
            await loadTodos();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Failed to add task');
    }
}

// Toggle task completion
async function toggleTask(id) {
    try {
        const response = await fetch('/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadTodos();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showError('Failed to update task');
    }
}

// Open edit modal
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    editingId = id;
    editInput.value = todo.task;
    editModal.classList.add('active');
    editInput.focus();
}

// Close edit modal
function closeEditModal() {
    editingId = null;
    editInput.value = '';
    editModal.classList.remove('active');
}

// Update task
async function updateTask() {
    const task = editInput.value.trim();
    
    if (!task) {
        showError('Invalid: Empty task');
        return;
    }
    
    if (!editingId) return;
    
    try {
        const response = await fetch('/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: editingId, task })
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeEditModal();
            clearError();
            await loadTodos();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('このタスクを削除してもよろしいですか？')) {
        return;
    }
    
    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadTodos();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task');
    }
}

// Save todos to file
async function saveTodos() {
    try {
        const response = await fetch('/save', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`タスクが正常に保存されました: ${result.filename}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error saving todos:', error);
        showError('Failed to save tasks');
    }
}

// Download todos JSON file
function downloadTodos() {
    window.location.href = '/download';
}

// Render todos
function renderTodos() {
    taskList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    todos.forEach(todo => {
        const taskItem = createTaskElement(todo);
        taskList.appendChild(taskItem);
    });
}

// Create task element
function createTaskElement(todo) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTask(todo.id));
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    if (todo.completed) {
        taskText.classList.add('completed');
    }
    taskText.textContent = todo.task;
    
    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskText);
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-primary';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => openEditModal(todo.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteTask(todo.id));
    
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);
    
    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);
    
    return taskItem;
}

// Update counters
function updateCounters() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    taskCount.textContent = total;
    completedCount.textContent = completed;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(clearError, 5000);
}

// Clear error message
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// XSS prevention helper (additional client-side protection)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, (m) => map[m]);
}