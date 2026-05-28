import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import { RiAddLine, RiDeleteBinLine, RiBookOpenLine } from 'react-icons/ri';

export default function JournalPage() {
  const { journal, addJournalEntry } = useApp();
  const [text, setText] = useState('');
  const [mood, setMood] = useState('😊');
  const [expanded, setExpanded] = useState(null);

  const MOODS = ['🤩','😊','😐','😔','😭'];

  const handleSave = () => {
    if (!text.trim()) return;
    addJournalEntry({
      id: uuidv4(),
      text: text.trim(),
      mood,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });
    setText('');
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      <div>
        <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">Daily Journal</h1>
        <p className="text-white/50 text-sm">Your thoughts, your story. ✍️</p>
      </div>

      {/* Write entry */}
      <div className="glass border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">How do you feel?</span>
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-base ${
                  mood === m ? 'bg-white/20 scale-110' : 'hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's on your mind today? Wins, struggles, random thoughts..."
          rows={5}
          className="neon-input w-full rounded-xl px-3 py-2.5 text-sm resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs">{wordCount} words</span>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-600 text-sm disabled:opacity-40 transition-opacity"
          >
            Save Entry ✨ +10 XP
          </button>
        </div>
      </div>

      {/* Entries */}
      {journal.length === 0 ? (
        <div className="text-center py-12">
          <RiBookOpenLine className="mx-auto text-white/20" size={40} />
          <p className="text-white/40 mt-3">No entries yet. Start writing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journal.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass border border-white/8 rounded-2xl p-4 cursor-pointer"
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{entry.mood}</span>
                  <div>
                    <div className="text-white/40 text-xs">{new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <p className={`text-white/80 text-sm mt-0.5 ${expanded !== entry.id ? 'line-clamp-2' : ''}`}>
                      {entry.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
