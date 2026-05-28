import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToday } from '../hooks';
import { getDailyQuote, CATEGORIES } from '../data/messages';
import { xpStorage } from '../utils/storage';
import {
  RiFireLine, RiTrophyLine, RiFlashlightLine, RiCheckboxCircleLine,
  RiTimeLine, RiCalendarLine, RiEmotionLine
} from 'react-icons/ri';

export default function Dashboard() {
  const { tasks, habits, stats, xp, mood, achievements } = useApp();
  const { dayName, dateFormatted, dateStr } = useToday();
  const quote = getDailyQuote();
  const xpPercent = xpStorage.getProgressPercent();

  // Today's tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      return t.date === dateStr || t.repeat === 'daily' ||
        (t.repeat === 'weekly' && new Date(t.date).getDay() === new Date().getDay()) ||
        (t.repeat === 'monthly' && new Date(t.date).getDate() === new Date().getDate()) ||
        (t.repeat === 'custom' && t.customDays?.includes(new Date().getDay()));
    });
  }, [tasks, dateStr]);

  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const progressPct = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;

  // Top habit streak
  const topStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

  // Productivity score (0-100)
  const productivityScore = useMemo(() => {
    const base = totalToday ? (completedToday / totalToday) * 60 : 30;
    const streakBonus = Math.min(topStreak * 2, 20);
    const xpBonus = Math.min((xp.level - 1) * 2, 20);
    return Math.round(Math.min(base + streakBonus + xpBonus, 100));
  }, [completedToday, totalToday, topStreak, xp.level]);

  // Weekly data for bar chart
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const history = stats.completionHistory?.[dateKey];
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: history?.completed || 0,
        total: history?.total || 0,
        isToday: i === 0,
      });
    }
    return days;
  }, [stats]);

  // Heatmap data (last 84 days = 12 weeks)
  const heatmapData = useMemo(() => {
    const cells = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const history = stats.completionHistory?.[dateKey];
      const ratio = history?.total ? history.completed / history.total : 0;
      const level = ratio === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
      cells.push({ date: dateKey, level, completed: history?.completed || 0 });
    }
    return cells;
  }, [stats]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    tasks.filter(t => t.completed).forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return CATEGORIES.map(c => ({ ...c, count: counts[c.id] || 0 }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [tasks]);

  // Today's mood
  const todayMood = mood.find(m => m.date === dateStr);

  const STAT_CARDS = [
    { label: 'Tasks Today', value: `${completedToday}/${totalToday}`, icon: RiCheckboxCircleLine, color: '#00f5ff', sub: `${progressPct}% complete` },
    { label: 'Best Streak', value: `${topStreak} days`, icon: RiFireLine, color: '#ff6b00', sub: 'Keep it going! 🔥' },
    { label: 'Level', value: xp.level, icon: RiTrophyLine, color: '#bf00ff', sub: `${xp.xp} XP accumulated` },
    { label: 'Productivity', value: `${productivityScore}%`, icon: RiFlashlightLine, color: '#ffdd00', sub: getScoreLabel(productivityScore) },
  ];

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">
          Good {getGreeting()}, <span className="gradient-text">Michael!</span> 👔
        </h1>
        <p className="text-white/50 text-sm mt-0.5">{dayName}, {dateFormatted}</p>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-neon-cyan/10 rounded-2xl p-4 bg-gradient-to-r from-neon-cyan/5 to-transparent"
      >
        <p className="text-white/80 text-sm italic">"{quote.text}"</p>
        <p className="text-neon-cyan/70 text-xs mt-1">— {quote.author}</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass border border-white/8 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon size={18} style={{ color: card.color }} />
              <span className="text-xs text-white/40">{card.label}</span>
            </div>
            <div className="font-display font-700 text-xl text-white">{card.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass border border-white/8 rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getLevelEmoji(xp.level)}</span>
            <div>
              <div className="text-white font-600 text-sm">Level {xp.level}</div>
              <div className="text-white/40 text-xs">{xp.xp} / {100 * xp.level} XP to next level</div>
            </div>
          </div>
          <span className="text-neon-purple font-mono text-sm">{xpPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full xp-bar rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly Bar Chart */}
        <div className="glass border border-white/8 rounded-2xl p-4">
          <h3 className="font-display font-600 text-white text-sm mb-4 flex items-center gap-2">
            <RiCalendarLine className="text-neon-cyan" /> Weekly Activity
          </h3>
          <div className="flex items-end gap-2 h-24">
            {weeklyData.map((d, i) => {
              const h = d.total ? Math.max(8, (d.completed / d.total) * 100) : 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t-lg"
                    style={{
                      background: d.isToday
                        ? 'linear-gradient(180deg, #00f5ff, #bf00ff)'
                        : d.completed > 0
                          ? 'rgba(0,245,255,0.3)'
                          : 'rgba(255,255,255,0.05)',
                      minHeight: 6,
                    }}
                    title={`${d.completed}/${d.total} tasks`}
                  />
                  <span className={`text-xs ${d.isToday ? 'text-neon-cyan' : 'text-white/40'}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass border border-white/8 rounded-2xl p-4">
          <h3 className="font-display font-600 text-white text-sm mb-3 flex items-center gap-2">
            <RiTimeLine className="text-neon-purple" /> Upcoming Tasks
          </h3>
          {todayTasks.filter(t => !t.completed).slice(0, 4).length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">
              🎉 All done! You're a legend.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.filter(t => !t.completed).slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span>{task.emoji}</span>
                  <span className="text-white/80 text-sm truncate flex-1">{task.title}</span>
                  <span className="text-white/30 text-xs">{task.section?.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass border border-white/8 rounded-2xl p-4">
        <h3 className="font-display font-600 text-white text-sm mb-4">Activity Heatmap</h3>
        <div className="grid grid-cols-[repeat(12,1fr)] gap-1">
          {Array.from({ length: 12 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const cellIdx = weekIdx * 7 + dayIdx;
                const cell = heatmapData[cellIdx];
                if (!cell) return <div key={dayIdx} className="w-full aspect-square rounded-sm" />;
                return (
                  <motion.div
                    key={dayIdx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: cellIdx * 0.002 }}
                    className={`w-full aspect-square rounded-sm heatmap-cell-${cell.level} cursor-pointer`}
                    title={`${cell.date}: ${cell.completed} tasks completed`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-white/30 text-xs">Less</span>
          {[0,1,2,3,4].map(l => (
            <div key={l} className={`w-3 h-3 rounded-sm heatmap-cell-${l}`} />
          ))}
          <span className="text-white/30 text-xs">More</span>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="glass border border-white/8 rounded-2xl p-4">
          <h3 className="font-display font-600 text-white text-sm mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryBreakdown.map(cat => {
              const maxCount = categoryBreakdown[0].count;
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{cat.emoji} {cat.label}</span>
                    <span style={{ color: cat.color }}>{cat.count} tasks</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mood today */}
      {todayMood && (
        <div className="glass border border-white/8 rounded-2xl p-4 flex items-center gap-3">
          <RiEmotionLine className="text-neon-yellow" size={20} />
          <div>
            <div className="text-white/60 text-xs">Today's Mood</div>
            <div className="text-white font-medium text-sm">{todayMood.emoji} {todayMood.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

function getScoreLabel(score) {
  if (score >= 90) return '🔥 On fire!';
  if (score >= 70) return '💪 Crushing it';
  if (score >= 50) return '📈 Getting there';
  if (score >= 30) return '😅 Could be better';
  return '😴 Wake up, boss!';
}

function getLevelEmoji(level) {
  if (level < 3) return '🥚';
  if (level < 5) return '🐣';
  if (level < 8) return '🐤';
  if (level < 12) return '🦅';
  if (level < 20) return '🔥';
  return '👑';
}
