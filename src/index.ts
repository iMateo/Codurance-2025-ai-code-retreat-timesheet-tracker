// Server entry point 
import express from 'express';
import path from 'path';
import { Database } from './database/Database';
import { TimesheetService } from './services/TimesheetService';
import { TimeEntry } from './models/TimeEntry';
import { Employee } from './models/Employee';
import { Project } from './models/Project';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware without proper configuration
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


let database: Database;
let timesheetService: TimesheetService;


async function initializeApp() {
  try {
    database = new Database();
    await database.initialize();
    timesheetService = new TimesheetService(database.getConnection());
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Poor error handling
  }
}

// API Routes

// Get time entries
app.get('/api/timeentries', async (req, res) => {
  try {
    const { employee, week } = req.query;
    
    // No input validation
    const weekDate = week ? new Date(week as string) : new Date();
    const entries = timesheetService.GetTimeEntriesForEmployee(employee as string, weekDate);
    
    res.json(entries);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' }); // Generic error response
  }
});

// Create time entry 
app.post('/api/timeentries', async (req, res) => {
  try {
    const entryData = req.body;
    
   
    const entry = timesheetService.createTimeEntry(
      entryData.employeeId,
      entryData.projectId,
      entryData.startTime,
      entryData.endTime,
      entryData.description,
      entryData.billableHours > 0
    );
    
   
    entry.save();
    
    res.json({ success: true, id: entry.id });
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ error: 'Failed to create time entry' });
  }
});


app.delete('/api/timeentries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
  
    await timesheetService.deleteTimeEntry(entryId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Submit timesheet
app.post('/api/timesheet/submit', async (req, res) => {
  try {
    const { employeeId, week } = req.body;
    const weekDate = new Date(week);

    const success = timesheetService.submitTimesheet(employeeId, weekDate);
    
    if (success) {
      res.json({ success: true, message: 'Timesheet submitted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to submit timesheet' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Get projects
app.get('/api/projects', async (req, res) => {
  try {
  
    const query = 'SELECT * FROM projects WHERE status = \"active\"';
    const projects = await database.all(query);
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get employees
app.get('/api/employees', async (req, res) => {
  try {
  
    const query = 'SELECT * FROM employees WHERE is_active = 1';
    const employees = await database.all(query);
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server 
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});