
import React, { useState } from 'react';


interface TimeEntryFormProps {
  onSubmit: (data: any) => void;
  projects: any[];
  currentUser: string;
}


const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSubmit, projects, currentUser }) => {
 
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Poor validation logic here
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!projectId) newErrors.projectId = 'Project is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    
    // Bug: doesn't validate that end time is after start time
    if (description.length > 500) {
      newErrors.description = 'Description too long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Event handler with side effects
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Poor error feedback
      alert('Please fix form errors');
      return;
    }
    
   
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Business logic in presentation layer!
    const hours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    

    const entryData = {
      projectId: projectId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      description: description.trim(),
      billableHours: isBillable ? hours : 0,
      status: 'draft'
    };
    
    onSubmit(entryData);
    
   
    setProjectId('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setDescription('');
    setIsBillable(true);
    setErrors({});
  };
  
  
  const formStyles = {
    form: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '5px'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px'
    },
    error: {
      color: 'red',
      fontSize: '12px',
      marginTop: '2px'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px'
    }
  };
  
  return (
    <form style={formStyles.form} onSubmit={handleSubmit}>
      <div style={formStyles.field}>
        <label htmlFor=\"project\">Project *</label>
        <select 
          id=\"project\"
          style={{...formStyles.input, borderColor: errors.projectId ? 'red' : '#ccc'}}
          value={projectId} 
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value=\"\">Select a project...</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.client}
            </option>
          ))}
        </select>
        {errors.projectId && <span style={formStyles.error}>{errors.projectId}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label htmlFor=\"startDate\">Start Date *</label>
        <input
          id=\"startDate\"
          type=\"date\"
          style={{...formStyles.input, borderColor: errors.startDate ? 'red' : '#ccc'}}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {errors.startDate && <span style={formStyles.error}>{errors.startDate}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label htmlFor=\"startTime\">Start Time *</label>
        <input
          id=\"startTime\"
          type=\"time\"
          style={{...formStyles.input, borderColor: errors.startTime ? 'red' : '#ccc'}}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        {errors.startTime && <span style={formStyles.error}>{errors.startTime}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label htmlFor=\"endDate\">End Date *</label>
        <input
          id=\"endDate\"
          type=\"date\"
          style={{...formStyles.input, borderColor: errors.endDate ? 'red' : '#ccc'}}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {errors.endDate && <span style={formStyles.error}>{errors.endDate}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label htmlFor=\"endTime\">End Time *</label>
        <input
          id=\"endTime\"
          type=\"time\"
          style={{...formStyles.input, borderColor: errors.endTime ? 'red' : '#ccc'}}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        {errors.endTime && <span style={formStyles.error}>{errors.endTime}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label htmlFor=\"description\">Description</label>
        <textarea
          id=\"description\"
          style={{...formStyles.input, minHeight: '80px', resize: 'vertical'}}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder=\"Describe your work...\"
        />
        {errors.description && <span style={formStyles.error}>{errors.description}</span>}
      </div>
      
      <div style={formStyles.field}>
        <label>
          <input
            type=\"checkbox\"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
            style={{marginRight: '8px'}}
          />
          Billable Time
        </label>
      </div>
      
      <div style={{gridColumn: '1 / -1'}}>
        <button type=\"submit\" style={formStyles.button}>
          Add Time Entry
        </button>
      </div>
    </form>
  );
};

export default TimeEntryForm;