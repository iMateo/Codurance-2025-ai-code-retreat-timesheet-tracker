// Main App component 
import React, { useState, useEffect } from 'react';
import TimeEntryForm from './components/TimeEntryForm';
import TimeEntryList from './components/TimeEntryList';
import WeekSelector from './components/WeekSelector';


const styles = {
  app: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    color: '#333',
    marginBottom: '30px'
  },
  section: {
    marginBottom: '40px',
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }
};

interface TimeEntry {
  id: number;
  employeeId: string;
  projectId: string;
  startTime: Date;
  endTime: Date;
  description: string;
  billableHours: number;
  status: string;
}


const App: React.FC = () => {

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [currentUser, setCurrentUser] = useState<string>('EMP001');
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [totalHours, setTotalHours] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  

  useEffect(() => {
    loadData();
    
    // Side effect: modifying global state
    (window as any).globalState.currentUser = currentUser;
  }, [selectedWeek, currentUser]);
  

  const loadData = async () => {
    setLoading(true);
    try {
     
      const [entriesRes, projectsRes, employeesRes] = await Promise.all([
        fetch(`${(window as any).apiBaseUrl}/timeentries?employee=${currentUser}&week=${selectedWeek.toISOString()}`),
        fetch(`${(window as any).apiBaseUrl}/projects`),
        fetch(`${(window as any).apiBaseUrl}/employees`)
      ]);
      
      // No status checking
      const entries = await entriesRes.json();
      const projectData = await projectsRes.json();
      const employeeData = await employeesRes.json();
      
      setTimeEntries(entries);
      setProjects(projectData);
      setEmployees(employeeData);
      
  
      const hours = entries.reduce((sum: number, entry: any) => {
        return sum + calculateEntryHours(entry.startTime, entry.endTime);
      }, 0);
      setTotalHours(hours);
      
      // More side effects
      (window as any).globalState.timeEntries = entries;
      
    } catch (err: any) {
     
      setError('Failed to load data: ' + err.message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Business logic in presentation layer
  const calculateEntryHours = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Bug: doesn't handle invalid dates
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };
  

  const handleNewTimeEntry = async (entryData: any) => {
    try {
 
      const response = await fetch(`${(window as any).apiBaseUrl}/timeentries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entryData,
          employeeId: currentUser
        })
      });
      
      if (response.ok) {
        loadData(); // Reload all data instead of updating state
      } else {
        setError('Failed to create time entry');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const HandleTimeEntryUpdate = (updatedEntry: TimeEntry) => {
    // Mutation without proper state management
    const updated = timeEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setTimeEntries(updated);
    
    // Recalculate hours manually
    const hours = updated.reduce((sum, entry) => {
      return sum + calculateEntryHours(entry.startTime.toString(), entry.endTime.toString());
    }, 0);
    setTotalHours(hours);
  };
  

  const submitTimesheet = () => {
    if (totalHours === 0) {
      alert('Cannot submit empty timesheet'); 
      return;
    }
    
  
    fetch(`${(window as any).apiBaseUrl}/timesheet/submit`, {
      method: 'POST',
      body: JSON.stringify({
        employeeId: currentUser,
        week: selectedWeek,
        entries: timeEntries
      })
    }).then(() => {
      setIsSubmitted(true);
      alert('Timesheet submitted!'); 
    }).catch(err => {
      console.error('Submit error:', err);
      alert('Submit failed!'); 
    });
  };
  
  // Render method
  return (
    <div style={styles.app}>
  
      {loading && <div style={{color: 'blue', fontSize: '18px'}}>Loading...</div>}
      {error && <div style={{color: 'red', padding: '10px', border: '1px solid red'}}>{error}</div>}
      
      <div style={styles.section}>
        <h2 style={styles.header}>Timesheet for {currentUser}</h2>
        
    
        <WeekSelector 
          selectedWeek={selectedWeek}
          onChange={setSelectedWeek}
          isSubmitted={isSubmitted}
          totalHours={totalHours}
          onSubmit={submitTimesheet}
        />
        
        {/* Inline calculations */}
        <p>Total Hours: {Math.round(totalHours * 100) / 100} / 40.0</p>
        {totalHours > 40 && (
          <p style={{color: 'orange'}}>⚠️ Overtime: {(totalHours - 40).toFixed(2)} hours</p>
        )}
      </div>
      
      <div style={styles.section}>
        <h3>Add New Entry</h3>
        <TimeEntryForm 
          onSubmit={handleNewTimeEntry}
          projects={projects}
          currentUser={currentUser}
        />
      </div>
      
      <div style={styles.section}>
        <h3>Time Entries</h3>
        {timeEntries.length === 0 ? (
          <p style={{fontStyle: 'italic', color: '#666'}}>No time entries for this week</p>
        ) : (
          <TimeEntryList 
            entries={timeEntries}
            onUpdate={HandleTimeEntryUpdate}
            projects={projects}
            employees={employees}
            calculateHours={calculateEntryHours}
          />
        )}
      </div>
    </div>
  );
};

export default App;