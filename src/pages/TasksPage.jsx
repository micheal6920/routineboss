import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToday } from '../hooks';
import { TIME_SECTIONS, CATEGORIES, getMotivationalMessage } from '../data/messages';
import TaskModal from '../components/modals/TaskModal';
import {
  RiAddLine, RiCheckLine, RiEditLine, RiDeleteBinLine,
  RiSearchLine, RiFilterLine, RiRepeatLine, RiAlarmLine
} from 'react-icons/ri';

export default function TasksPage() {
  const { tasks, completeTask, deleteTask, settings } = useApp();
  const { dateStr, dayName, dateFormatted, timeFormatted } = useToday();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [funnyMsg, setFunnyMsg] = useState(null);

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchDate = t.date === dateStr || t.repeat === 'daily' ||
        (t.repeat === 'weekly' && new Date(t.date).getDay() === new Date().getDay()) ||
        (t.repeat === 'monthly' && new Date(t.date).getDate() === new Date().getDate()) ||
        (t.repeat === 'custom' && t.customDays?.includes(new Date().getDay()));
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || t.category === filterCategory;
      const matchPri = filterPriority === 'all' || t.priority === filterPriority;
      return matchDate && matchSearch && matchCat && matchPri;
    });
  }, [tasks, dateStr, search, filterCategory, filterPriority]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    TIME_SECTIONS.forEach(s => {
      groups[s.id] = todayTasks.filter(t => t.section === s.id);
    });
    return groups;
  }, [todayTasks]);

  const handleComplete = (task) => {
    if (task.completed) return;
    completeTask(task.id);
  };

  const handleUncompleted = (task) => {
    if (!task.completed) {
      const msg = getMotivationalMessage(task.category, settings.motivationMode || 'roast', task.title);
      setFunnyMsg({ text: msg, task: task.title });
      setTimeout(() => setFunnyMsg(null), 4000);
    }
  };

  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">Today's Tasks</h1>
          <p className="text-white/50 text-sm mt-0.5">{dayName}, {dateFormatted} · {timeFormatted}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-600 text-sm"
        >
          <RiAddLine size={18} /> Add Task
        </motion.button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="glass border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Today's Progress</span>
            <span className="font-mono text-neon-cyan">{completedCount}/{totalCount} done</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-white/40">{progress}% complete</span>
          </div>
        </div>
      )}

      {/* Funny Motivation Popup */}
      <AnimatePresence>
        {funnyMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass border border-neon-pink/30 rounded-2xl p-4 bg-gradient-to-r from-neon-pink/10 to-transparent"
          >
            <p className="text-white/90 text-sm">😤 <strong className="text-neon-pink">"{funnyMsg.task}"</strong> still pending...</p>
            <p className="text-white/70 text-sm mt-1 italic">"{funnyMsg.text}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="neon-input w-full rounded-xl pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="neon-input rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="neon-input rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {/* Task Sections */}
      {TIME_SECTIONS.map(section => {
        const sectionTasks = groupedTasks[section.id] || [];
        if (sectionTasks.length === 0 && !search) return null;

        return (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{section.emoji}</span>
              <h2 className="font-display font-600 text-white/80 text-sm">{section.label}</h2>
              <span className="text-white/30 text-xs">{section.time}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: section.color + '22', color: section.color }}>
                {sectionTasks.length}
              </span>
            </div>

            {sectionTasks.length === 0 ? (
              <div className="text-center py-6 text-white/25 text-sm glass border border-white/5 rounded-2xl">
                No tasks for this time ✨
              </div>
            ) : (
              <div className="space-y-2">
                {sectionTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onComplete={() => handleComplete(task)}
                    onHover={() => handleUncompleted(task)}
                    onEdit={() => { setEditTask(task); setShowModal(true); }}
                    onDelete={() => deleteTask(task.id)}
                    sectionColor={section.color}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {totalCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-white/50 text-lg font-display">No tasks yet, boss!</p>
          <p className="text-white/30 text-sm mt-1">Add your first task to start crushing it.</p>
          <button
            onClick={() => { setEditTask(null); setShowModal(true); }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-900 font-600 text-sm"
          >
            Add First Task ✨
          </button>
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal task={editTask} onClose={() => { setShowModal(false); setEditTask(null); }} />
      )}
    </div>
  );
}

function TaskCard({ task, index, onComplete, onHover, onEdit, onDelete, sectionColor }) {
  const CATEGORY = CATEGORIES.find(c => c.id === task.category);
  const priorityBorders = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`task-card glass border border-white/8 rounded-2xl p-4 ${priorityBorders[task.priority]} ${task.completed ? 'opacity-60' : ''}`}
      onMouseEnter={onHover}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onComplete}
          className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-neon-green border-neon-green'
              : 'border-white/30 hover:border-neon-cyan/60'
          }`}
        >
          {task.completed && <RiCheckLine size={14} className="text-dark-900" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{task.emoji}</span>
            <span className={`font-medium text-sm ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
              {task.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {CATEGORY && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: CATEGORY.color + '20', color: CATEGORY.color }}>
                {CATEGORY.emoji} {CATEGORY.label}
              </span>
            )}
            {task.time && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <RiAlarmLine size={11} /> {task.time}
              </span>
            )}
            {task.repeat && task.repeat !== 'none' && (
              <span className="text-xs text-neon-purple/70 flex items-center gap-1">
                <RiRepeatLine size={11} /> {task.repeat}
              </span>
            )}
          </div>
          {task.notes && <p className="text-xs text-white/40 mt-1 truncate">{task.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <RiEditLine size={14} />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg hover:bg-neon-pink/10 flex items-center justify-center text-white/40 hover:text-neon-pink transition-all">
            <RiDeleteBinLine size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
