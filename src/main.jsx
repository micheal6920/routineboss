import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { requestNotificationPermission, startReminderLoop } from './services/emailReminder'

// Request browser notification permission on first load
requestNotificationPermission();

// Start the 1-minute reminder polling loop
startReminderLoop((task) => {
  console.log('Reminder fired for:', task.title);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
