import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MOODS } from '../data/messages';
import { v4 as uuidv4 } from 'uuid';
import { moodStorage } from '../utils/storage';

export default function MoodPage() {
  const { mood, addMoodEntry, showNotification } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = mood.find(m => m.date === today);

  const handleMoodSelect = (moodItem) => {
    if (todayEntry) {
      showNotification("You've already logged today's mood!", 'info');
      return;
    }
    addMoodEntry({
      id: uuidv4(),
      date: today,
      mood: moodItem.id,
      emoji: moodItem.emoji,
      label: moodItem.label,
      color: moodItem.color,
      createdAt: new Date().toISOString(),
    });
    showNotification(`Mood logged: ${moodItem.emoji} ${moodItem.label}`, 'success');
  };

  // Last 30 days mood
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateKey = d.toISOString().split('T')[0];
    const entry = mood.find(m => m.date === dateKey);
    return { date: dateKey, entry, day: d.getDate() };
  });

  // Mood distribution
  const moodCounts = MOODS.map(m => ({
    ...m,
    count: mood.filter(e => e.mood === m.id).length,
  }));
  const maxCount = Math.max(...moodCounts.map(m => m.count), 1);

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      <div>
        <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">Mood Tracker</h1>
        <p className="text-white/50 text-sm">How are you feeling today? 💭</p>
      </div>

      {/* Today's Mood Picker */}
      <div className="glass border border-white/10 rounded-2xl p-5">
        <h3 className="text-white/70 text-sm mb-4 text-center">
          {todayEntry ? `Today: ${todayEntry.emoji} ${todayEntry.label}` : 'Log your mood for today'}
        </h3>
        <div className="flex justify-center gap-3 lg:gap-5">
          {MOODS.map((m, i) => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.15, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMoodSelect(m)}
              disabled={!!todayEntry}
              className={`flex flex-col items-center gap-2 transition-all ${todayEntry?.mood === m.id ? 'scale-110' : ''} ${todayEntry && todayEntry.mood !== m.id ? 'opacity-30' : ''}`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl glass"
                style={{ border: `2px solid ${todayEntry?.mood === m.id ? m.color : 'rgba(255,255,255,0.1)'}` }}
              >
                {m.emoji}
              </div>
              <span className="text-xs text-white/60">{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 30-day calendar */}
      <div className="glass border border-white/8 rounded-2xl p-4">
        <h3 className="font-display font-600 text-white text-sm mb-3">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {last30.map(({ date, entry, day }) => (
            <div
              key={date}
              className="aspect-square rounded-lg flex items-center justify-center text-xs cursor-default"
              style={{
                background: entry ? entry.color + '30' : 'rgba(255,255,255,0.04)',
                border: date === today ? '1px solid rgba(0,245,255,0.4)' : '1px solid transparent',
              }}
              title={`${date}: ${entry ? entry.label : 'No data'}`}
            >
              {entry ? entry.emoji : <span className="text-white/20">{day}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="glass border border-white/8 rounded-2xl p-4">
        <h3 className="font-display font-600 text-white text-sm mb-4">Mood Distribution</h3>
        <div className="space-y-3">
          {moodCounts.map(m => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{m.emoji}</span>
              <div className="flex-1">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
              </div>
              <span className="text-white/50 text-xs w-8 text-right">{m.count}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
