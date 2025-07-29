// タスク管理クラス
class TodoApp {
    constructor() {
        this.tasks = this.loadFromLocalStorage() || [];
        this.nextId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
        this.editingTaskId = null;
        this.init();
    }

    init() {
        // DOM要素の取得
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addButton: document.getElementById('addButton'),
            saveButton: document.getElementById('saveButton'),
            downloadButton: document.getElementById('downloadButton'),
            taskList: document.getElementById('taskList'),
            taskCount: document.getElementById('taskCount'),
            completedCount: document.getElementById('completedCount'),
            message: document.getElementById('message'),
            editModal: document.getElementById('editModal'),
            editInput: document.getElementById('editInput'),
            saveEditButton: document.getElementById('saveEditButton'),
            cancelEditButton: document.getElementById('cancelEditButton')
        };

        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 初期表示
        this.render();
    }

    setupEventListeners() {
        // タスク追加
        this.elements.addButton.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 保存とダウンロード
        this.elements.saveButton.addEventListener('click', () => this.saveTasks());
        this.elements.downloadButton.addEventListener('click', () => this.downloadTasks());

        // モーダル制御
        this.elements.saveEditButton.addEventListener('click', () => this.saveEdit());
        this.elements.cancelEditButton.addEventListener('click', () => this.closeEditModal());
        this.elements.editModal.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) this.closeEditModal();
        });
    }

    // ローカルストレージから読み込み
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('todoTasks');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    }

    // ローカルストレージに保存
    saveToLocalStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    // タスク追加
    addTask() {
        const text = this.sanitizeInput(this.elements.taskInput.value);

        // バリデーション
        if (!text) {
            this.showMessage('Invalid: Empty task', 'error');
            return;
        }

        if (text.length > 100) {
            this.showMessage('Invalid: Too long', 'error');
            return;
        }

        if (this.tasks.some(task => task.text === text)) {
            this.showMessage('Duplicate task', 'error');
            return;
        }

        if (this.tasks.length >= 50) {
            this.showMessage('Limit exceeded', 'error');
            return;
        }

        // タスク追加
        const newTask = {
            id: this.nextId++,
            text: text,
            completed: false
        };

        this.tasks.push(newTask);
        this.elements.taskInput.value = '';
        this.saveToLocalStorage();
        this.render();
        this.showMessage('タスクを追加しました', 'success');
        
        console.log(`Operation: add, Task: ${text}, Result: success`);
    }

    // タスク編集
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            this.showMessage('Invalid: Task not found', 'error');
            return;
        }

        this.editingTaskId = id;
        this.elements.editInput.value = task.text;
        this.elements.editModal.classList.add('show');
        this.elements.editInput.focus();
    }

    saveEdit() {
        const newText = this.sanitizeInput(this.elements.editInput.value);

        if (!newText) {
            this.showMessage('Invalid: Empty task', 'error');
            return;
        }

        if (newText.length > 100) {
            this.showMessage('Invalid: Too long', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            const oldText = task.text;
            task.text = newText;
            this.saveToLocalStorage();
            this.render();
            this.closeEditModal();
            this.showMessage('タスクを更新しました', 'success');
            console.log(`Operation: edit, Task: ${oldText} -> ${newText}, Result: success`);
        }
    }

    closeEditModal() {
        this.elements.editModal.classList.remove('show');
        this.editingTaskId = null;
    }

    // タスク削除
    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            this.showMessage('Invalid: Task not found', 'error');
            return;
        }

        if (confirm(`「${task.text}」を削除しますか？`)) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
            this.showMessage('タスクを削除しました', 'success');
            console.log(`Operation: delete, Task: ${task.text}, Result: success`);
        }
    }

    // 完了状態の切り替え
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            this.showMessage('Invalid: Task not found', 'error');
            return;
        }

        task.completed = !task.completed;
        this.saveToLocalStorage();
        this.render();
        console.log(`Operation: toggle, Task: ${task.text}, Result: ${task.completed ? 'completed' : 'uncompleted'}`);
    }

    // タスク保存（JSONファイル）
    saveTasks() {
        try {
            const json = JSON.stringify(this.tasks, null, 2);
            // GitHub Pages環境ではファイル保存はできないため、ローカルストレージに保存
            localStorage.setItem('todo_results', json);
            this.showMessage('Results saved to localStorage (todo_results)', 'success');
            console.log('Operation: save, Result: success');
        } catch (e) {
            this.showMessage('保存に失敗しました', 'error');
            console.error('Save failed:', e);
        }
    }

    // タスクダウンロード
    downloadTasks() {
        try {
            const json = JSON.stringify(this.tasks, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'todo_results.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showMessage('JSONファイルをダウンロードしました', 'success');
            console.log('Operation: download, Result: success');
        } catch (e) {
            this.showMessage('ダウンロードに失敗しました', 'error');
            console.error('Download failed:', e);
        }
    }

    // 入力のサニタイズ
    sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }

    // メッセージ表示
    showMessage(text, type) {
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
        setTimeout(() => {
            this.elements.message.className = 'message';
        }, 5000);
    }

    // 画面の再描画
    render() {
        // タスクリストの更新
        this.elements.taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'タスクがありません';
            this.elements.taskList.appendChild(emptyState);
        } else {
            this.tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = 'task-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                
                const text = document.createElement('span');
                text.className = `task-text ${task.completed ? 'completed' : ''}`;
                text.textContent = task.text;
                
                const actions = document.createElement('div');
                actions.className = 'task-actions';
                
                const editButton = document.createElement('button');
                editButton.className = 'button edit-button';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => this.editTask(task.id));
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'button delete-button';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => this.deleteTask(task.id));
                
                actions.appendChild(editButton);
                actions.appendChild(deleteButton);
                
                li.appendChild(checkbox);
                li.appendChild(text);
                li.appendChild(actions);
                
                this.elements.taskList.appendChild(li);
            });
        }
        
        // 統計情報の更新
        this.elements.taskCount.textContent = this.tasks.length;
        this.elements.completedCount.textContent = this.tasks.filter(t => t.completed).length;
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});