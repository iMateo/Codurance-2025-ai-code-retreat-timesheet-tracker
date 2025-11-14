// React entry point 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global state 
window.globalState = {
  currentUser: 'EMP001',
  timeEntries: [],
  selectedWeek: new Date()
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

// No error boundary
root.render(<App />);