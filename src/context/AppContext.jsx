import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { taskStorage, habitStorage, xpStorage, settingsStorage, themeStorage, completionStorage, achievementStorage } from '../utils/storage';
import { ACHIEVEMENTS } from '../data/motivationalMessages';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [xpData, setXpData] = useState({ xp: 0, level: 1, totalXp: 0 });
  const [settings, setSettings] = useState({});
  const [theme, setThemeState] = useState('dark');
  const [completions, setCompletions] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationPopup, setMotivationPopup] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load all data from localStorage on mount
  useEffect(() => {
    setTasks(taskStorage.getAll());
    setHabits(habitStorage.getAll());
    setXpData(xpStorage.get());
    setSettings(settingsStorage.get());
    setThemeState(themeStorage.get());
    setCompletions(completionStorage.getAll());
    setAchievements(achievementStorage.getAll());
  }, []);

  // Apply dark/light mode class to HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    themeStorage.set(theme);
  }, [theme]);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3500);
  };

  const addXP = useCallback((amount, reason = '') => {
    const newData = xpStorage.add(amount);
    setXpData({ ...newData });
    showNotification(`+${amount} XP ${reason ? `(${reason})` : ''}`, 'xp');
    checkAchievements(newData);
  }, []);

  const checkAchievements = (xpData) => {
    const allTasks = taskStorage.getAll();
    const completed = allTasks.filter(t => t.completed).length;
    const allHabits = habitStorage.getAll();

    const checks = [
      { id: 'first_task', condition: completed >= 1 },
      { id: 'tasks_10', condition: completed >= 10 },
      { id: 'tasks_50', condition: completed >= 50 },
      { id: 'tasks_100', condition: completed >= 100 },
      { id: 'level_5', condition: xpData.level >= 5 },
      { id: 'level_10', condition: xpData.level >= 10 },
      { id: 'habit_creator', condition: allHabits.length >= 5 },
    ];

    checks.forEach(({ id, condition }) => {
      if (condition) {
        const unlocked = achievementStorage.unlock(id);
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (achievement) {
            showNotification(`🏆 Achievement: ${achievement.name}!`, 'achievement');
            setAchievements(achievementStorage.getAll());
          }
        }
      }
    });
  };

  // Task CRUD
  const addTask = (taskData) => {
    const task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      ...taskData,
    };
    taskStorage.add(task);
    setTasks(taskStorage.getAll());
    showNotification('Task added! 🎯');
    return task;
  };

  const updateTask = (id, updates) => {
    taskStorage.update(id, updates);
    setTasks(taskStorage.getAll());
  };

  const deleteTask = (id) => {
    taskStorage.delete(id);
    setTasks(taskStorage.getAll());
    showNotification('Task deleted 🗑️', 'info');
  };

  const completeTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const wasCompleted = task.completed;
    const updates = {
      completed: !wasCompleted,
      completedAt: wasCompleted ? null : new Date().toISOString(),
    };

    taskStorage.update(id, updates);
    setTasks(taskStorage.getAll());

    if (!wasCompleted) {
      // Trigger confetti and XP
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      const xpGain = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 20;
      addXP(xpGain, task.title);

      const today = new Date().toISOString().split('T')[0];
      completionStorage.markComplete(today, id);
      setCompletions(completionStorage.getAll());
      showNotification(`✅ "${task.title}" done! Crushing it!`, 'success');
      checkAchievements(xpData);
    }
  };

  const reorderTasks = (newOrder) => {
    taskStorage.save(newOrder);
    setTasks(newOrder);
  };

  // Habit CRUD
  const addHabit = (habitData) => {
    const habit = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      totalCompletions: 0,
      ...habitData,
    };
    habitStorage.add(habit);
    setHabits(habitStorage.getAll());
    showNotification('Habit created! 🌱');
    return habit;
  };

  const updateHabit = (id, updates) => {
    habitStorage.update(id, updates);
    setHabits(habitStorage.getAll());
  };

  const deleteHabit = (id) => {
    habitStorage.delete(id);
    setHabits(habitStorage.getAll());
    showNotification('Habit removed 🗑️', 'info');
  };

  const completeHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const alreadyDone = habit.completedDays?.includes(today);

    if (alreadyDone) {
      const updates = {
        completedDays: habit.completedDays.filter(d => d !== today),
        totalCompletions: Math.max(0, (habit.totalCompletions || 0) - 1),
      };
      // Recalculate streak
      habitStorage.update(id, updates);
    } else {
      const newDays = [...(habit.completedDays || []), today].sort();
      // Calculate streak
      let streak = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (newDays.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }

      const updates = {
        completedDays: newDays,
        streak,
        longestStreak: Math.max(streak, habit.longestStreak || 0),
        totalCompletions: (habit.totalCompletions || 0) + 1,
      };
      habitStorage.update(id, updates);
      addXP(25, `${habit.name} streak`);

      if (streak > 0 && streak % 7 === 0) {
        showNotification(`🔥 ${streak}-day streak on "${habit.name}"!`, 'achievement');
      }
    }

    setHabits(habitStorage.getAll());
  };

  const updateSettings = (updates) => {
    settingsStorage.update(updates);
    setSettings(settingsStorage.get());
  };

  const getTimeSection = () => {
    const h = currentTime.getHours();
    if (h >= 4 && h < 7) return 'early_morning';
    if (h >= 7 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  };

  const getBackground = () => {
    const section = getTimeSection();
    const bgs = {
      early_morning: 'from-indigo-950 via-purple-950 to-rose-950',
      morning: 'from-orange-950 via-amber-900 to-yellow-900',
      afternoon: 'from-sky-950 via-blue-900 to-cyan-950',
      evening: 'from-orange-950 via-purple-950 to-pink-950',
      night: 'from-dark-900 via-dark-800 to-dark-700',
    };
    return bgs[section] || bgs.night;
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => {
      const taskDate = t.date || today;
      return taskDate === today || t.repeat === 'daily';
    });
    const completed = todayTasks.filter(t => t.completed).length;
    const total = todayTasks.length;
    const score = total ? Math.round((completed / total) * 100) : 0;
    return { completed, total, pending: total - completed, score, tasks: todayTasks };
  };

  return (
    <AppContext.Provider value={{
      tasks, habits, xpData, settings, theme, completions, achievements,
      notification, showConfetti, motivationPopup, activeTab, currentTime,
      setActiveTab, toggleTheme, showNotification,
      addTask, updateTask, deleteTask, completeTask, reorderTasks,
      addHabit, updateHabit, deleteHabit, completeHabit,
      updateSettings, addXP, getTimeSection, getBackground, getTodayStats,
      setMotivationPopup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
// This file was already created above. Append aliases handled via re-export in a wrapper.
