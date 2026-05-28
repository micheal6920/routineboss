import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../context/AppContext';
import { useVoiceInput } from '../../hooks';
import { TIME_SECTIONS, CATEGORIES, PRIORITIES, TASK_EMOJIS } from '../../data/messages';
import { RiCloseLine, RiMicLine, RiMic2Line } from 'react-icons/ri';

export default function TaskModal({ task = null, onClose }) {
  const { addTask, updateTask, showNotification } = useApp();

  const [form, setForm] = useState({
    title: task?.title || '',
    emoji: task?.emoji || '📝',
    section: task?.section || 'morning',
    category: task?.category || 'personal',
    priority: task?.priority || 'medium',
    repeat: task?.repeat || 'none',
    customDays: task?.customDays || [],
    time: task?.time || '',
    notes: task?.notes || '',
    date: task?.date || new Date().toISOString().split('T')[0],
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { isListening, supported: voiceSupported, startListening } = useVoiceInput(
    useCallback((text) => setForm(f => ({ ...f, title: text })), [])
  );

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      showNotification('⚠️ Task title is required!', 'info');
      return;
    }
    if (task) {
      updateTask(task.id, form);
      showNotification('✏️ Task updated!', 'success');
    } else {
      addTask({
        id: uuidv4(),
        ...form,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      });
      showNotification('✅ Task added! Time to get things done!', 'success');
    }
    onClose();
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative glass border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-display font-700 text-white text-lg">
              {task ? '✏️ Edit Task' : '➕ New Task'}
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <RiCloseLine size={22} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Title + Emoji + Voice */}
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Task Title</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-lg hover:border-neon-cyan/40 transition-all flex-shrink-0"
                >
                  {form.emoji}
                </button>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="What needs to be done?"
                  className="neon-input flex-1 rounded-xl px-3 py-2 text-sm"
                  autoFocus
                />
                {voiceSupported && (
                  <button
                    onClick={startListening}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      isListening ? 'bg-neon-pink/20 border border-neon-pink/40 text-neon-pink' : 'glass border border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {isListening ? <RiMic2Line size={18} /> : <RiMicLine size={18} />}
                  </button>
                )}
              </div>
              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 glass border border-white/10 rounded-xl p-3 grid grid-cols-10 gap-1"
                  >
                    {TASK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { set('emoji', emoji); setShowEmojiPicker(false); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-base"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section */}
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Time of Day</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => set('section', s.id)}
                    className={`py-2 px-2 rounded-xl text-xs text-center transition-all border ${
                      form.section === s.id
                        ? 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan'
                        : 'glass border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="neon-input w-full rounded-xl px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => set('priority', p.id)}
                      className={`flex-1 py-2 rounded-xl text-xs transition-all border ${
                        form.priority === p.id ? 'border-current text-current bg-current/10' : 'glass border-white/10 text-white/50'
                      }`}
                      style={form.priority === p.id ? { color: p.color, borderColor: p.color + '60' } : {}}
                    >
                      {p.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="neon-input w-full rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Time (optional)</label>
                <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                  className="neon-input w-full rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Repeat */}
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Repeat</label>
              <div className="flex flex-wrap gap-2">
                {['none','daily','weekly','monthly','custom'].map(r => (
                  <button
                    key={r}
                    onClick={() => set('repeat', r)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all border ${
                      form.repeat === r
                        ? 'bg-neon-purple/20 border-neon-purple/40 text-neon-purple'
                        : 'glass border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {form.repeat === 'custom' && (
                <div className="flex gap-2 mt-2">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const days = form.customDays.includes(i)
                          ? form.customDays.filter(x => x !== i)
                          : [...form.customDays, i];
                        set('customDays', days);
                      }}
                      className={`w-8 h-8 rounded-lg text-xs transition-all ${
                        form.customDays.includes(i)
                          ? 'bg-neon-purple/30 text-neon-purple border border-neon-purple/40'
                          : 'glass border border-white/10 text-white/50'
                      }`}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any details..."
                rows={2}
                className="neon-input w-full rounded-xl px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-white/10 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-600 text-sm hover:opacity-90 transition-opacity"
            >
              {task ? 'Save Changes' : 'Add Task ✨'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
