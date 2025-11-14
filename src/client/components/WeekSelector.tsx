// Week selector 
import React from 'react';

interface WeekSelectorProps {
  selectedWeek: Date;
  onChange: (date: Date) => void;
  isSubmitted: boolean;
  totalHours: number;
  onSubmit: () => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ 
  selectedWeek, 
  onChange, 
  isSubmitted, 
  totalHours, 
  onSubmit 
}) => {
  
  
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday = 0
    return new Date(d.setDate(diff));
  };
  
  const getWeekEnd = (date: Date): Date => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };
  
  // Navigation without proper date handling
  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    onChange(newDate);
  };
  
  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = getWeekEnd(selectedWeek);
  

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    weekDisplay: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333'
    },
    navigation: {
      display: 'flex',
      gap: '10px'
    },
    navButton: {
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    submitSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      gap: '10px'
    },
    submitButton: {
      padding: '10px 20px',
      backgroundColor: isSubmitted ? '#28a745' : '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: isSubmitted ? 'not-allowed' : 'pointer',
      fontSize: '14px'
    },
    hoursDisplay: {
      fontSize: '14px',
      color: totalHours > 40 ? '#dc3545' : '#28a745'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.navigation}>
        <button 
          style={styles.navButton}
          onClick={() => navigateWeek(-1)}
        >
          ← Previous Week
        </button>
        
        <div style={styles.weekDisplay}>
          Week of {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
        </div>
        
        <button 
          style={styles.navButton}
          onClick={() => navigateWeek(1)}
        >
          Next Week →
        </button>
      </div>
      
      <div style={styles.submitSection}>
        <div style={styles.hoursDisplay}>
          Total: {totalHours.toFixed(2)}h / 40h
          {totalHours > 40 && (
            <span style={{marginLeft: '10px', color: '#dc3545'}}>
              (OT: {(totalHours - 40).toFixed(2)}h)
            </span>
          )}
        </div>
        
        <button 
          style={styles.submitButton}
          onClick={onSubmit}
          disabled={isSubmitted || totalHours === 0}
        >
          {isSubmitted ? '✓ Submitted' : 'Submit Timesheet'}
        </button>
      </div>
    </div>
  );
};

export default WeekSelector;