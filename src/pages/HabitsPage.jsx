import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/messages';
import { RiAddLine, RiFireLine, RiDeleteBinLine, RiCheckLine, RiTrophyLine } from 'react-icons/ri';

export default function HabitsPage() {
  const { habits, addHabit, deleteHabit, completeHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', emoji: '🔥', category: 'personal', targetDays: 30 });
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addHabit({
      id: uuidv4(),
      ...form,
      completedDays: [],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString(),
    });
    setForm({ name: '', emoji: '🔥', category: 'personal', targetDays: 30 });
    setShowForm(false);
  };

  const EMOJIS = ['🔥','💪','📚','🧘','🏃','☕','🎯','💻','🎨','🌿','💊','🌅','🚴','🎵','✍️'];

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">Habits</h1>
          <p className="text-white/50 text-sm">Build streaks. Build life. 🔥</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink text-white font-600 text-sm"
        >
          <RiAddLine size={18} /> New Habit
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass border border-neon-orange/20 rounded-2xl p-4 space-y-3"
          >
            <h3 className="text-white font-600 text-sm">New Habit</h3>
            <div className="flex gap-2">
              <select
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                className="neon-input rounded-xl px-2 py-2 text-sm w-14 text-center"
              >
                {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input
                type="text"
                placeholder="Habit name (e.g. 'Meditate 10 min')"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="neon-input flex-1 rounded-xl px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="neon-input flex-1 rounded-xl px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-xs">Goal:</span>
                <input
                  type="number"
                  value={form.targetDays}
                  onChange={e => setForm(f => ({ ...f, targetDays: parseInt(e.target.value) || 30 }))}
                  className="neon-input w-16 rounded-xl px-2 py-2 text-sm text-center"
                  min="1" max="365"
                />
                <span className="text-white/50 text-xs">days</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl glass border border-white/10 text-white/60 text-sm">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink text-white font-600 text-sm">Add Habit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔥</div>
          <p className="text-white/50 text-lg font-display">No habits yet!</p>
          <p className="text-white/30 text-sm">Streaks don't build themselves.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, i) => {
            const checkedToday = habit.completedDays?.includes(today);
            const progress = habit.targetDays
              ? Math.min(Math.round(((habit.completedDays?.length || 0) / habit.targetDays) * 100), 100)
              : 0;
            const category = CATEGORIES.find(c => c.id === habit.category);

            // Last 7 days for mini calendar
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return d.toISOString().split('T')[0];
            });

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass border border-white/8 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Check button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => completeHabit(habit.id)}
                    disabled={checkedToday}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                      checkedToday
                        ? 'bg-neon-green/20 border border-neon-green/40 scale-110'
                        : 'glass border border-white/20 hover:border-neon-orange/40'
                    }`}
                  >
                    {checkedToday ? '✅' : habit.emoji}
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{habit.name}</span>
                      {checkedToday && <span className="text-xs text-neon-green">Done today!</span>}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Streak */}
                      <div className="flex items-center gap-1">
                        <RiFireLine className="text-neon-orange" size={13} />
                        <span className="text-xs font-mono" style={{ color: habit.currentStreak > 0 ? '#ff6b00' : '#ffffff60' }}>
                          {habit.currentStreak || 0}d
                        </span>
                      </div>
                      {/* Best */}
                      <div className="flex items-center gap-1">
                        <RiTrophyLine className="text-yellow-400" size={13} />
                        <span className="text-xs text-white/50">{habit.longestStreak || 0}d best</span>
                      </div>
                      {/* Category */}
                      {category && (
                        <span className="text-xs" style={{ color: category.color }}>{category.emoji}</span>
                      )}
                    </div>

                    {/* 7-day mini calendar */}
                    <div className="flex gap-1 mt-2">
                      {last7.map((date, di) => {
                        const done = habit.completedDays?.includes(date);
                        const isToday = date === today;
                        return (
                          <div
                            key={di}
                            className={`w-6 h-6 rounded-md text-xs flex items-center justify-center ${
                              done ? 'bg-neon-orange/70 text-white' :
                              isToday ? 'border border-neon-orange/40 text-white/30' :
                              'bg-white/5 text-white/20'
                            }`}
                            title={date}
                          >
                            {done ? '✓' : new Date(date + 'T12:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress */}
                    {habit.targetDays && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                          <span>{habit.completedDays?.length || 0}/{habit.targetDays} days</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #ff6b00, #ff006e)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-white/20 hover:text-neon-pink transition-colors flex-shrink-0"
                  >
                    <RiDeleteBinLine size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
