import { AppProvider, useApp } from './context/AppContext';
import { useKeyboardShortcuts } from './hooks';
import Sidebar from './components/ui/Sidebar';
import Notification from './components/ui/Notification';
import Confetti from './components/ui/Confetti';
import Mascot from './components/ui/Mascot';
import Dashboard from './components/dashboard/Dashboard';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import PomodoroPage from './pages/PomodoroPage';
import JournalPage from './pages/JournalPage';
import MoodPage from './pages/MoodPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

const TABS = ['dashboard','tasks','habits','pomodoro','journal','mood','achievements','settings'];

function AppInner() {
  const { activeTab, setActiveTab, getTimeSection } = useApp();

  const section = getTimeSection();
  const bgMap = {
    early_morning: 'bg-morning',
    morning: 'bg-morning',
    afternoon: 'bg-afternoon',
    evening: 'bg-evening',
    night: 'bg-night',
  };
  const bg = bgMap[section] || 'bg-night';

  // Keyboard shortcuts: 1-8 switch tabs, ? shows help
  useKeyboardShortcuts({
    '1': () => setActiveTab('dashboard'),
    '2': () => setActiveTab('tasks'),
    '3': () => setActiveTab('habits'),
    '4': () => setActiveTab('pomodoro'),
    '5': () => setActiveTab('journal'),
    '6': () => setActiveTab('mood'),
    '7': () => setActiveTab('achievements'),
    '8': () => setActiveTab('settings'),
  });

  const pages = {
    dashboard: <Dashboard />,
    tasks: <TasksPage />,
    habits: <HabitsPage />,
    pomodoro: <PomodoroPage />,
    journal: <JournalPage />,
    mood: <MoodPage />,
    achievements: <AchievementsPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className={`min-h-screen ${bg} flex`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen lg:ml-64">
        {pages[activeTab] || <Dashboard />}
      </main>
      <Notification />
      <Confetti />
      <Mascot />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
