import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useToday } from '../../hooks';
import { getRandomQuote } from '../../data/motivationalMessages';
import { completionStorage } from '../../utils/storage';
import XPBar from '../ui/XPBar';
import {
  RiCheckLine, RiTimeLine, RiFireLine, RiTrophyLine,
  RiBarChartLine, RiCalendarLine, RiFlashlightLine, RiHeart3Line
} from 'react-icons/ri';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ icon, label, value, sub, color = '#00f5ff', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-body mb-1">{label}</p>
          <p className="font-display font-bold text-2xl text-white">{value}</p>
          {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: color + '22', color }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function Heatmap() {
  const completions = completionStorage.getAll();
  const today = new Date();
  const cells = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = (completions[key] || []).length;
    const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    cells.push({ key, level, count });
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <RiCalendarLine className="text-neon-cyan" size={16} />
        <h3 className="text-white/70 text-sm font-display font-semibold">Activity Heatmap</h3>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {cells.map(cell => (
          <div
            key={cell.key}
            title={`${cell.key}: ${cell.count} tasks`}
            className={`heatmap-cell-${cell.level} w-full aspect-square rounded-sm cursor-pointer transition-transform hover:scale-125`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-white/30 text-xs">Less</span>
        {[0,1,2,3,4].map(l => <div key={l} className={`w-3 h-3 rounded-sm heatmap-cell-${l}`} />)}
        <span className="text-white/30 text-xs">More</span>
      </div>
    </div>
  );
}

function WeeklyChart({ tasks }) {
  const data = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => {
        const td = t.completedAt?.split('T')[0];
        return td === key;
      });
      return {
        day: days[d.getDay()],
        completed: dayTasks.filter(t => t.completed).length,
        total: dayTasks.length,
      };
    });
  }, [tasks]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <RiBarChartLine className="text-neon-purple" size={16} />
        <h3 className="text-white/70 text-sm font-display font-semibold">Weekly Overview</h3>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            itemStyle={{ color: '#00f5ff' }}
          />
          <Area type="monotone" dataKey="completed" stroke="#00f5ff" strokeWidth={2} fill="url(#cg)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, habits, xpData, settings } = useApp();
  const { dateFormatted, dayName } = useToday();
  const quote = useMemo(() => getRandomQuote(), []);
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => {
    return t.date === today || t.repeat === 'daily' ||
      (t.repeat === 'weekly' && new Date(t.date).getDay() === new Date().getDay()) ||
      (t.repeat === 'monthly' && new Date(t.date).getDate() === new Date().getDate()) ||
      (t.repeat === 'custom' && t.customDays?.includes(new Date().getDay()));
  });
  const completedToday = todayTasks.filter(t => t.completed).length;
  const pendingToday = todayTasks.length - completedToday;
  const productivityScore = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const topStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const upcomingTasks = tasks
    .filter(t => !t.completed && t.time)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/50 text-sm font-body">{dayName}, {dateFormatted}</p>
        <h1 className="font-display font-bold text-white text-2xl lg:text-3xl mt-0.5">
          Hey, <span className="gradient-text">{settings.userName || 'Michael'}</span>! 👋
        </h1>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass border border-neon-purple/20 rounded-2xl p-4 bg-gradient-to-r from-neon-purple/5 to-transparent"
      >
        <p className="text-white/80 text-sm italic font-body">"{quote.quote}"</p>
        <p className="text-neon-purple/70 text-xs mt-1 font-body">— {quote.author}</p>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <XPBar />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<RiCheckLine />} label="Completed Today" value={completedToday} sub={`of ${todayTasks.length} tasks`} color="#00ff88" delay={0.2} />
        <StatCard icon={<RiTimeLine />} label="Pending" value={pendingToday} sub="tasks left" color="#ff6b00" delay={0.25} />
        <StatCard icon={<RiFireLine />} label="Top Streak" value={`${topStreak}d`} sub="keep it up!" color="#ff6b00" delay={0.3} />
        <StatCard icon={<RiFlashlightLine />} label="Score" value={`${productivityScore}%`} sub="productivity" color="#bf00ff" delay={0.35} />
      </div>

      {/* Today Progress */}
      {todayTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm font-display font-semibold">Today's Progress</h3>
            <span className="font-mono text-neon-cyan text-sm">{productivityScore}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="progress-bar h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${productivityScore}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          {productivityScore === 100 && (
            <p className="text-neon-green text-xs mt-2 text-center">🎉 Perfect day! You're an absolute legend!</p>
          )}
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass border border-white/10 rounded-2xl p-4">
          <WeeklyChart tasks={tasks} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass border border-white/10 rounded-2xl p-4">
          <Heatmap />
        </motion.div>
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="glass border border-white/10 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-display font-semibold mb-3">⏰ Upcoming Tasks</h3>
          <div className="space-y-2">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <span>{task.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm truncate">{task.title}</p>
                </div>
                <span className="font-mono text-xs text-neon-cyan">{task.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Habit Streaks */}
      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass border border-white/10 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-display font-semibold mb-3">🔥 Active Habits</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {habits.slice(0, 6).map(habit => {
              const todayDone = habit.completedDays?.includes(today);
              return (
                <div key={habit.id} className={`p-3 rounded-xl border transition-all ${todayDone ? 'border-neon-green/30 bg-neon-green/5' : 'border-white/10'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-white/80 text-xs truncate">{habit.name}</p>
                      <p className="text-neon-orange text-xs">🔥 {habit.streak || 0}d</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && habits.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Ready to become a RoutineBoss?</h2>
          <p className="text-white/50 text-sm">Add your first task or habit to get started!</p>
        </motion.div>
      )}
    </div>
  );
}
