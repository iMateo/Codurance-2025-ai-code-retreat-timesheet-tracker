
console.log('Loading legacy timesheet application...');


let currentUser = 'EMP001';
let timeEntries = [];
let projects = [];
let employees = [];
let selectedWeek = new Date();


document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  initializeApp();
});


async function initializeApp() {
  try {
    // Render UI first so we have a container
    renderUI();
    
    // Load data after UI is ready
    await loadProjects();
    await loadEmployees(); 
    await loadTimeEntries();
    
    setupEventListeners();
    console.log('App initialization complete');
  } catch (error) {
    console.error('App initialization failed:', error);
    document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Failed to load application. Please check the server is running.</div>';
  }
}


async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    const data = await response.json();
    projects = data;
    console.log('Projects loaded:', projects.length);
    populateProjectDropdown(); // Update UI after loading
  } catch (error) {
    console.error('Failed to load projects:', error);
    projects = []; // Fallback to empty array
  }
}

async function loadEmployees() {
  try {
    const response = await fetch('/api/employees');
    const data = await response.json();
    employees = data;
    console.log('Employees loaded:', employees.length);
  } catch (error) {
    console.error('Failed to load employees:', error);
    employees = []; // Fallback to empty array
  }
}


async function loadTimeEntries() {
  try {
    const weekParam = selectedWeek.toISOString();
    const response = await fetch(`/api/timeentries?employee=${currentUser}&week=${weekParam}`);
    const data = await response.json();
    timeEntries = data;
    console.log('Time entries loaded:', timeEntries.length);
    updateUI(); // Update UI after loading
  } catch (error) {
    console.error('Failed to load time entries:', error);
    timeEntries = []; // Fallback to empty array
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.innerHTML = 'Failed to load time entries';
    }
  }
}


function renderUI() {
  const container = document.getElementById('root');
  
  // Inline HTML generation 
  container.innerHTML = `
    <div id="error" style="color: red; margin-bottom: 20px;"></div>
    
    <div class="section">
      <h2>Timesheet for ${currentUser}</h2>
      
      <div class="week-selector">
        <button onclick="navigateWeek(-1)">← Previous Week</button>
        <span id="week-display">${formatWeek(selectedWeek)}</span>
        <button onclick="navigateWeek(1)">Next Week →</button>
        
        <div style="float: right;">
          <span id="total-hours">Total: 0h</span>
          <button id="submit-btn" onclick="submitTimesheet()">Submit Timesheet</button>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3>Add Time Entry</h3>
      <form id="time-entry-form" onsubmit="handleFormSubmit(event)">
        <div class="form-row">
          <div class="form-field">
            <label>Project:</label>
            <select id="project-select" required>
              <option value="">Select project...</option>
            </select>
          </div>
          
          <div class="form-field">
            <label>Start Date:</label>
            <input type="date" id="start-date" required>
          </div>
          
          <div class="form-field">
            <label>Start Time:</label>
            <input type="time" id="start-time" required>
          </div>
          
          <div class="form-field">
            <label>End Date:</label>
            <input type="date" id="end-date" required>
          </div>
          
          <div class="form-field">
            <label>End Time:</label>
            <input type="time" id="end-time" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field">
            <label>Description:</label>
            <textarea id="description" placeholder="Describe your work..."></textarea>
          </div>
          
          <div class="form-field">
            <label>
              <input type="checkbox" id="billable" checked> Billable
            </label>
          </div>
          
          <div class="form-field">
            <button type="submit">Add Entry</button>
          </div>
        </div>
      </form>
    </div>
    
    <div class="section">
      <h3>Time Entries</h3>
      <div id="entries-container">
        <!-- Entries will be populated by updateUI() -->
      </div>
    </div>
  `;
  
  // Don't populate dropdown here - will be done after data loads
  // populateProjectDropdown();
  // updateUI(); - will be called after data loads
}


function populateProjectDropdown() {
  const select = document.getElementById('project-select');
  
  if (!select) {
    console.warn('Project select element not found');
    return;
  }
  
  // Clear existing options except first
  while (select.children.length > 1) {
    select.removeChild(select.lastChild);
  }
  
  // Add project options
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = `${project.name} - ${project.client}`;
    select.appendChild(option);
  });
  
  console.log('Project dropdown populated with', projects.length, 'projects');
}


function updateUI() {
  // Update week display
  const weekDisplay = document.getElementById('week-display');
  if (weekDisplay) {
    weekDisplay.textContent = formatWeek(selectedWeek);
  }
  
  // Calculate total hours 
  let totalHours = 0;
  timeEntries.forEach(entry => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const hours = (end - start) / (1000 * 60 * 60); // Can be negative!
    totalHours += hours;
  });
  
  // Update total display
  const totalHoursEl = document.getElementById('total-hours');
  if (totalHoursEl) {
    totalHoursEl.textContent = `Total: ${totalHours.toFixed(2)}h / 40h`;
  }
  
  // Update submit button
  const submitBtn = document.getElementById('submit-btn');
  const hasSubmitted = timeEntries.some(entry => entry.status === 'submitted');
  
  if (submitBtn) {
    if (hasSubmitted) {
      submitBtn.textContent = '✓ Submitted';
      submitBtn.disabled = true;
    } else {
      submitBtn.textContent = 'Submit Timesheet';
      submitBtn.disabled = totalHours === 0;
    }
  }
  
  // Render entries table
  renderEntriesTable();
}

// Poor table generation
function renderEntriesTable() {
  const container = document.getElementById('entries-container');
  
  if (timeEntries.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No time entries for this week</p>';
    return;
  }
  
  // Generate table HTML
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd;">
          <th style="padding: 12px; text-align: left;">Date</th>
          <th style="padding: 12px; text-align: left;">Time</th>
          <th style="padding: 12px; text-align: left;">Project</th>
          <th style="padding: 12px; text-align: left;">Description</th>
          <th style="padding: 12px; text-align: left;">Hours</th>
          <th style="padding: 12px; text-align: left;">Status</th>
          <th style="padding: 12px; text-align: left;">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  timeEntries.forEach(entry => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    
    const project = projects.find(p => p.id === entry.project_id);
    const projectName = project ? `${project.name} (${project.client})` : 'Unknown Project';
    
    const statusColor = getStatusColor(entry.status);
    const rowBg = entry.status === 'submitted' ? '#fff3cd' : 'white';
    
    tableHTML += `
      <tr style="background-color: ${rowBg}; border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${start.toLocaleDateString()}</td>
        <td style="padding: 10px;">${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        <td style="padding: 10px;"><strong>${projectName}</strong></td>
        <td style="padding: 10px;">${entry.description || '<em style="color: #666;">No description</em>'}</td>
        <td style="padding: 10px;"><strong>${hours.toFixed(2)}h</strong>${entry.billable_hours > 0 ? '<br><small style="color: #28a745;">💰 Billable</small>' : ''}</td>
        <td style="padding: 10px;"><span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; color: white; background-color: ${statusColor};">${entry.status}</span></td>
        <td style="padding: 10px;">
          <button onclick="editEntry(${entry.id})" style="padding: 5px 10px; margin: 0 2px; background: #ffc107; border: none; border-radius: 3px; cursor: pointer;">Edit</button>
          ${entry.status !== 'submitted' ? `<button onclick="deleteEntry(${entry.id})" style="padding: 5px 10px; margin: 0 2px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>` : ''}
        </td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  container.innerHTML = tableHTML;
}

// Inline helper functions
function getStatusColor(status) {
  switch (status) {
    case 'submitted': return '#28a745';
    case 'approved': return '#007bff';
    case 'rejected': return '#dc3545';
    default: return '#6c757d';
  }
}

function formatWeek(date) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
}


function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday = 0
  return new Date(d.setDate(diff));
}

// Event handlers 
function navigateWeek(direction) {
  const newDate = new Date(selectedWeek);
  newDate.setDate(newDate.getDate() + (direction * 7));
  selectedWeek = newDate;
  loadTimeEntries(); // Reload data
}

function handleFormSubmit(event) {
  event.preventDefault();
  
 
  const projectId = document.getElementById('project-select').value;
  const startDate = document.getElementById('start-date').value;
  const startTime = document.getElementById('start-time').value;
  const endDate = document.getElementById('end-date').value;
  const endTime = document.getElementById('end-time').value;
  const description = document.getElementById('description').value;
  const billable = document.getElementById('billable').checked;
  
  if (!projectId || !startDate || !startTime || !endDate || !endTime) {
    alert('Please fill in all required fields'); 
    return;
  }
  

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  
  // Bug: no validation that end is after start
  const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
  
  const entryData = {
    employeeId: currentUser,
    projectId: projectId,
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
    description: description.trim(),
    billableHours: billable ? hours : 0
  };
  
  // Create entry
  createTimeEntry(entryData);
}

function createTimeEntry(entryData) {
  fetch('/api/timeentries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entryData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Clear form
      document.getElementById('time-entry-form').reset();
      // Reload data
      loadTimeEntries();
      alert('Time entry added!'); 
    } else {
      alert('Failed to add time entry');
    }
  })
  .catch(error => {
    console.error('Create error:', error);
    alert('Error adding time entry');
  });
}

function deleteEntry(entryId) {
  if (confirm('Delete this entry?')) { 
    fetch(`/api/timeentries/${entryId}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadTimeEntries(); // Reload data
        } else {
          alert('Delete failed!');
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        alert('Delete failed!');
      });
  }
}

function editEntry(entryId) {
  alert('Edit functionality not implemented yet!');
}

function submitTimesheet() {
  if (confirm('Submit timesheet? You won\'t be able to edit entries after submission.')) {
    fetch('/api/timesheet/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: currentUser,
        week: selectedWeek.toISOString()
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Timesheet submitted successfully!');
        loadTimeEntries(); // Reload to show updated status
      } else {
        alert('Submit failed!');
      }
    })
    .catch(error => {
      console.error('Submit error:', error);
      alert('Submit failed!');
    });
  }
}

// Poor global event handling
function setupEventListeners() {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const startTime = document.getElementById('start-time');
  const endTime = document.getElementById('end-time');
  
  if (startDate) startDate.value = today;
  if (endDate) endDate.value = today;
  if (startTime) startTime.value = '09:00';
  if (endTime) endTime.value = '17:00';
  
  console.log('Event listeners set up, default values applied');
}