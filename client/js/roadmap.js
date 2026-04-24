document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  renderRoadmap();

  // Setup form submission
  const taskForm = document.getElementById('taskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveTask();
    });
  }
});

// ═══ LOCAL STORAGE HELPERS ═══
function getTasks() {
  const data = localStorage.getItem('forgepath_roadmap');
  return data ? JSON.parse(data) : [];
}

function saveTasks(tasks) {
  localStorage.setItem('forgepath_roadmap', JSON.stringify(tasks));
  renderRoadmap();
}

// ═══ RENDER KANBAN ═══
function renderRoadmap() {
  const tasks = getTasks();
  
  const cols = {
    planned: document.getElementById('col-planned'),
    inprogress: document.getElementById('col-inprogress'),
    completed: document.getElementById('col-completed')
  };

  const counts = { planned: 0, inprogress: 0, completed: 0 };

  // Clear columns
  Object.values(cols).forEach(col => { if(col) col.innerHTML = ''; });

  tasks.forEach(task => {
    if (!cols[task.status]) task.status = 'planned'; // fallback
    
    counts[task.status]++;
    
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.id = `task-${task.id}`;
    
    // Check if overdue
    const isOverdue = task.status !== 'completed' && new Date(task.date) < new Date(new Date().toDateString());
    
    let actionsHtml = '';
    if (task.status === 'planned') {
      actionsHtml = `
        <button class="task-action-btn" onclick="moveTask('${task.id}', 'inprogress')" title="Start Task">▶</button>
        <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">🗑</button>
      `;
    } else if (task.status === 'inprogress') {
      actionsHtml = `
        <button class="task-action-btn" onclick="moveTask('${task.id}', 'planned')" title="Move Back">⏪</button>
        <button class="task-action-btn" onclick="moveTask('${task.id}', 'completed')" title="Complete Task" style="color:var(--success-color)">✔</button>
      `;
    } else {
      actionsHtml = `
        <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">🗑</button>
      `;
    }

    card.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      ${task.desc ? `<p>${escapeHtml(task.desc)}</p>` : ''}
      <div class="task-meta">
        <div class="task-date ${isOverdue ? 'overdue' : ''}">
          🕒 ${new Date(task.date).toLocaleDateString()}
        </div>
        <div class="task-actions">
          ${actionsHtml}
        </div>
      </div>
    `;

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    if (cols[task.status]) cols[task.status].appendChild(card);
  });

  // Update counts
  if (document.getElementById('count-planned')) document.getElementById('count-planned').textContent = counts.planned;
  if (document.getElementById('count-inprogress')) document.getElementById('count-inprogress').textContent = counts.inprogress;
  if (document.getElementById('count-completed')) document.getElementById('count-completed').textContent = counts.completed;

  // Setup drag zones
  document.querySelectorAll('.kanban-tasks').forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
  });
}

// ═══ TASK ACTIONS ═══
function openTaskModal(status = 'planned') {
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskStatus').value = status;
  
  // Default date to today
  document.getElementById('taskDate').valueAsDate = new Date();
  
  document.getElementById('modalTitle').textContent = 'Add Schedule Task';
  document.getElementById('taskModalOverlay').classList.add('open');
}

function closeTaskModal() {
  document.getElementById('taskModalOverlay').classList.remove('open');
}

function saveTask() {
  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();
  const date = document.getElementById('taskDate').value;
  const status = document.getElementById('taskStatus').value;

  if (!title || !date) return;

  const tasks = getTasks();
  
  if (id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      tasks[idx] = { ...tasks[idx], title, desc, date };
    }
  } else {
    tasks.push({
      id: Date.now().toString(),
      title,
      desc,
      date,
      status,
      createdAt: new Date().toISOString()
    });
    showToast('Task added to schedule!', 'success');
  }

  saveTasks(tasks);
  closeTaskModal();
}

function moveTask(id, newStatus) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks(tasks);
    
    if (newStatus === 'completed') {
      showToast('🎉 Task completed on schedule!');
      setTimeout(() => {
        if(typeof saveNotification === 'function') {
          saveNotification('🏆 Roadmap Milestone: Task Completed!');
        }
      }, 1000);
    }
  }
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    showToast('Task removed.', 'success');
  }
}

// ═══ DRAG AND DROP LOGIC ═══
let draggedTask = null;

function handleDragStart(e) {
  draggedTask = this;
  setTimeout(() => this.classList.add('dragging'), 0);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.id);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedTask = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  if (!draggedTask) return;
  
  const targetCol = this.closest('.kanban-tasks');
  if (targetCol) {
    const newStatus = targetCol.getAttribute('data-status');
    const taskId = draggedTask.id.replace('task-', '');
    
    // Only move if status changed
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      moveTask(taskId, newStatus);
    }
  }
}
