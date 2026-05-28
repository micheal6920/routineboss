// RoutineBoss Storage Utilities
const KEYS = {
  TASKS: 'routineboss_tasks',
  HABITS: 'routineboss_habits',
  SETTINGS: 'routineboss_settings',
  JOURNAL: 'routineboss_journal',
  MOOD: 'routineboss_mood',
  XP: 'routineboss_xp',
  ACHIEVEMENTS: 'routineboss_achievements',
  THEME: 'routineboss_theme',
  COMPLETIONS: 'routineboss_completions',
};

export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  export: () => {
    const data = {};
    Object.values(KEYS).forEach(key => {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    });
    return data;
  },
  import: (data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },
};

export const taskStorage = {
  getAll: () => storage.get(KEYS.TASKS, []),
  save: (tasks) => storage.set(KEYS.TASKS, tasks),
  add: (task) => { const t = taskStorage.getAll(); t.push(task); taskStorage.save(t); },
  update: (id, updates) => {
    const tasks = taskStorage.getAll();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) { tasks[idx] = { ...tasks[idx], ...updates }; taskStorage.save(tasks); }
  },
  delete: (id) => taskStorage.save(taskStorage.getAll().filter(t => t.id !== id)),
};

export const habitStorage = {
  getAll: () => storage.get(KEYS.HABITS, []),
  save: (habits) => storage.set(KEYS.HABITS, habits),
  add: (habit) => { const h = habitStorage.getAll(); h.push(habit); habitStorage.save(h); },
  update: (id, updates) => {
    const habits = habitStorage.getAll();
    const idx = habits.findIndex(h => h.id === id);
    if (idx !== -1) { habits[idx] = { ...habits[idx], ...updates }; habitStorage.save(habits); }
  },
  delete: (id) => habitStorage.save(habitStorage.getAll().filter(h => h.id !== id)),
};

export const completionStorage = {
  getAll: () => storage.get(KEYS.COMPLETIONS, {}),
  markComplete: (date, taskId) => {
    const c = completionStorage.getAll();
    if (!c[date]) c[date] = [];
    if (!c[date].includes(taskId)) c[date].push(taskId);
    storage.set(KEYS.COMPLETIONS, c);
  },
  getForDate: (date) => (completionStorage.getAll()[date] || []),
};

export const xpStorage = {
  get: () => storage.get(KEYS.XP, { xp: 0, level: 1, totalXp: 0 }),
  add: (amount) => {
    const data = xpStorage.get();
    data.xp += amount;
    data.totalXp += amount;
    while (data.xp >= data.level * 500) { data.xp -= data.level * 500; data.level += 1; }
    storage.set(KEYS.XP, data);
    return data;
  },
};

export const settingsStorage = {
  get: () => storage.get(KEYS.SETTINGS, {
    emailjsServiceId: '', emailjsTemplateId: '', emailjsPublicKey: '',
    userEmail: '', userName: 'Michael', notifications: true, sounds: true,
    motivationMode: 'roast', focusMode: false,
  }),
  save: (s) => storage.set(KEYS.SETTINGS, s),
  update: (updates) => settingsStorage.save({ ...settingsStorage.get(), ...updates }),
};

export const journalStorage = {
  getAll: () => storage.get(KEYS.JOURNAL, []),
  add: (entry) => {
    const entries = journalStorage.getAll();
    entries.unshift(entry);
    storage.set(KEYS.JOURNAL, entries.slice(0, 100));
  },
};

export const moodStorage = {
  getAll: () => storage.get(KEYS.MOOD, {}),
  set: (date, mood) => {
    const m = moodStorage.getAll();
    m[date] = mood;
    storage.set(KEYS.MOOD, m);
  },
  getForDate: (date) => (moodStorage.getAll()[date] || null),
};

export const achievementStorage = {
  getAll: () => storage.get(KEYS.ACHIEVEMENTS, []),
  unlock: (id) => {
    const a = achievementStorage.getAll();
    if (!a.includes(id)) { a.push(id); storage.set(KEYS.ACHIEVEMENTS, a); return true; }
    return false;
  },
  has: (id) => achievementStorage.getAll().includes(id),
};

export const themeStorage = {
  get: () => storage.get(KEYS.THEME, 'dark'),
  set: (theme) => storage.set(KEYS.THEME, theme),
};

export { KEYS };

// Extra alias for progress percent
export const getXPProgressPercent = () => {
  const data = xpStorage.get();
  const maxXP = data.level * 500;
  return Math.round((data.xp / maxXP) * 100);
};
