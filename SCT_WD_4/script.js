class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const defaultDateTime = now.toISOString().slice(0, 16);
        document.getElementById('taskDateTime').value = defaultDateTime;
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');

        addTaskBtn.addEventListener('click', () => {
            this.addTask();
        });

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        document.getElementById('clearCompletedBtn').addEventListener('click', () => {
            this.clearCompleted();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEdit();
        });

        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskDateTime = document.getElementById('taskDateTime');
        
        const text = taskInput.value.trim();
        const datetime = taskDateTime.value;
        
        if (!text) {
            alert('Please enter a task!');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            datetime: datetime,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        taskInput.value = '';
        taskInput.focus();
        
        const now = new Date();
        now.setHours(now.getHours() + 1);
        taskDateTime.value = now.toISOString().slice(0, 16);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editTaskDateTime').value = task.datetime;
            this.openModal();
        }
    }

    saveEdit() {
        const editTaskInput = document.getElementById('editTaskInput');
        const editTaskDateTime = document.getElementById('editTaskDateTime');
        
        const text = editTaskInput.value.trim();
        const datetime = editTaskDateTime.value;
        
        if (!text) {
            alert('Please enter a task!');
            return;
        }
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.datetime = datetime;
            this.saveTasks();
            this.renderTasks();
            this.closeModal();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    clearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    openModal() {
        document.getElementById('editModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTaskId = null;
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }
        
        tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        
        filteredTasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                const editBtn = taskElement.querySelector('.edit-btn');
                const deleteBtn = taskElement.querySelector('.delete-btn');
                
                checkbox.addEventListener('click', () => {
                    this.toggleTask(task.id);
                });
                
                editBtn.addEventListener('click', () => {
                    this.editTask(task.id);
                });
                
                deleteBtn.addEventListener('click', () => {
                    this.deleteTask(task.id);
                });
            }
        });
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    createTaskHTML(task) {
        const formattedDate = this.formatDateTime(task.datetime);
        const isOverdue = !task.completed && new Date(task.datetime) < new Date();
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-datetime">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                        ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-icon edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    formatDateTime(datetime) {
        const date = new Date(datetime);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (diffDays === 1) {
            return `Tomorrow at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (diffDays === -1) {
            return `Yesterday at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (diffDays > 1) {
            return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 