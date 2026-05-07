/**
 * ============================================
 * INTERACTIVE TO-DO LIST APPLICATION
 * ============================================
 * 
 * Demonstrates key DOM manipulation concepts:
 * - Selecting elements
 * - Creating and removing elements
 * - Event listeners (click, input, submit)
 * - Event delegation
 * - Updating the DOM based on state
 * 
 * ============================================
 */

// =============================================
// STATE MANAGEMENT
// =============================================

// This is our "source of truth" - all tasks are stored here
const tasks = [];

// Current filter applied to the UI
let currentFilter = 'all';

// Generate unique IDs for tasks
let nextId = 1;

// =============================================
// DOM ELEMENT REFERENCES
// =============================================

const taskInput = document.getElementById('taskInput');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// =============================================
// EVENT LISTENERS - INPUT & BUTTONS
// =============================================

/**
 * Submit event: clicking "Add Task" or pressing Enter in the input
 * adds the task to our state and updates the UI.
 */
taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleAddTask();
});

/**
 * Input event: enable the submit button only when there is text to add.
 */
taskInput.addEventListener('input', () => {
    const hasText = taskInput.value.trim().length > 0;
    addTaskBtn.disabled = !hasText;
});

/**
 * Keyboard event: Escape clears the input quickly.
 */
taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        taskInput.value = '';
        addTaskBtn.disabled = true;
    }
});

/**
 * Clear Completed button - removes all completed tasks
 */
clearCompletedBtn.addEventListener('click', () => {
    // filter() keeps only tasks that are NOT completed
    const activeTasks = tasks.filter(task => !task.completed);
    tasks.splice(0, tasks.length, ...activeTasks);
    render();
});

// =============================================
// EVENT LISTENERS - DELEGATION
// =============================================

/**
 * DELEGATION PATTERN:
 * Instead of adding listeners to each task item, we add ONE listener
 * to the parent <ul>. When user clicks anything inside, we check
 * what was clicked and act accordingly.
 * 
 * Benefits:
 * - Only one listener, not hundreds
 * - Works even for tasks added after page load
 * - More efficient
 */
taskList.addEventListener('click', (event) => {
    // event.target is the element that was actually clicked
    const taskItem = event.target.closest('.task-item');

    // Clicking checkbox - toggle completed status
    if (event.target.matches('.checkbox') && taskItem) {
        const taskId = parseInt(taskItem.dataset.taskId);
        toggleTask(taskId);
    }

    // Clicking task text - also toggle (user-friendly)
    if (event.target.matches('.task-text') && taskItem) {
        const taskId = parseInt(taskItem.dataset.taskId);
        toggleTask(taskId);
    }

    // Clicking delete button - remove the task
    if (event.target.matches('.delete-btn') && taskItem) {
        const taskId = parseInt(taskItem.dataset.taskId);
        deleteTask(taskId);
    }
});

/**
 * Filter buttons - show different subsets of tasks
 */
filterBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('filter-btn-active'));

        // Add active class to clicked button
        event.target.classList.add('filter-btn-active');
        event.target.setAttribute('aria-pressed', 'true');
        filterBtns.forEach(b => {
            if (b !== event.target) {
                b.setAttribute('aria-pressed', 'false');
            }
        });

        // Update current filter and re-render
        currentFilter = event.target.dataset.filter;
        render();
    });
});

// =============================================
// CORE FUNCTIONS
// =============================================

/**
 * Add a new task to our state and re-render the UI
 */
function handleAddTask() {
    const text = taskInput.value.trim();

    // Validate - don't add empty tasks
    if (!text) {
        alert('Please enter a task');
        return;
    }

    // Create task object
    const task = {
        id: nextId++,
        text: text,
        completed: false,
        createdAt: new Date()
    };

    // Add to our tasks array (state)
    tasks.push(task);

    // Clear input field
    taskInput.value = '';
    addTaskBtn.disabled = true;
    taskInput.focus(); // Put cursor back in input

    // Update the page
    render();
}

/**
 * Toggle the completed status of a task
 */
function toggleTask(taskId) {
    // Find the task with this ID
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        // Flip the completed boolean
        task.completed = !task.completed;
    }

    // Update the page
    render();
}

/**
 * Delete a task by removing it from our state
 */
function deleteTask(taskId) {
    // filter() returns a new array without the deleted task
    const indexToRemove = tasks.findIndex(t => t.id === taskId);

    if (indexToRemove !== -1) {
        tasks.splice(indexToRemove, 1);
    }

    // Update the page
    render();
}

// =============================================
// FILTERING & COUNTING
// =============================================

/**
 * Get tasks based on current filter
 */
function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    // 'all' - return all tasks
    return tasks;
}

/**
 * Update the stats display (Total, Active, Completed)
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// =============================================
// RENDERING (UPDATE THE DOM)
// =============================================

/**
 * THE MAIN RENDER FUNCTION
 * 
 * This is called whenever our state changes. It:
 * 1. Clears the task list
 * 2. Gets filtered tasks
 * 3. Creates DOM elements for each task
 * 4. Updates counters
 * 5. Shows/hides empty state
 */
function render() {
    // Step 1: Clear the current list (remove all <li>)
    taskList.innerHTML = '';

    // Step 2: Get tasks to display based on filter
    const filteredTasks = getFilteredTasks();

    // Step 3: Create a <li> for each task and add to list
    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });

    // Step 4: Update statistics
    updateStats();

    // Step 5: Show empty state if no tasks at all
    if (tasks.length === 0) {
        emptyState.classList.add('show');
        emptyState.style.display = 'block';
    } else {
        emptyState.classList.remove('show');
        emptyState.style.display = 'none';
    }
}

/**
 * Create a single task <li> element
 * 
 * Build nodes with createElement/textContent so user-entered task text
 * is treated as plain text, not HTML.
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    const checkbox = document.createElement('div');
    const taskText = document.createElement('span');
    const deleteBtn = document.createElement('button');

    // Add classes
    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }

    // Add data attribute for easy reference
    li.dataset.taskId = task.id;

    checkbox.className = 'checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', String(task.completed));

    taskText.className = 'task-text';
    taskText.textContent = task.text;

    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', `Delete ${task.text}`);
    deleteBtn.textContent = 'x';

    li.append(checkbox, taskText, deleteBtn);

    return li;
}

// =============================================
// INITIALIZATION
// =============================================

/**
 * When page first loads, set focus to input and render empty list
 */
window.addEventListener('load', () => {
    filterBtns.forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.dataset.filter === currentFilter));
    });
    taskInput.focus();
    render();
});

// =============================================
// BONUS: LOAD SAMPLE DATA
// =============================================

/**
 * For demo purposes, add some sample tasks.
 * Comment this out for a blank list on first visit.
 */
function addSampleTasks() {
    const samples = [
        'Complete JavaScript lessons',
        'Build a portfolio project',
        'Review DOM manipulation concepts',
        'Practice with event listeners'
    ];

    samples.forEach(text => {
        tasks.push({
            id: nextId++,
            text: text,
            completed: Math.random() > 0.7 // 30% complete
        });
    });

    render();
}

// Uncomment to enable sample tasks on load
// addSampleTasks();
