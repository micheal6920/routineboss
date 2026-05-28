import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  RiDashboardLine, RiTaskLine, RiFireLine, RiTimerLine,
  RiMoonLine, RiSunLine, RiBookOpenLine, RiSettings3Line,
  RiEmotionLine, RiMedalLine, RiCloseLine, RiMenuLine
} from 'react-icons/ri';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { id: 'tasks', label: 'Tasks', icon: RiTaskLine },
  { id: 'habits', label: 'Habits', icon: RiFireLine },
  { id: 'pomodoro', label: 'Pomodoro', icon: RiTimerLine },
  { id: 'journal', label: 'Journal', icon: RiBookOpenLine },
  { id: 'mood', label: 'Mood', icon: RiEmotionLine },
  { id: 'achievements', label: 'Achievements', icon: RiMedalLine },
  { id: 'settings', label: 'Settings', icon: RiSettings3Line },
];

export default function Sidebar() {
  const { activeTab: activePage, setActiveTab: setActivePage, settings, updateSettings, xpData: xp } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const xpPercent = xp ? Math.round((xp.xp / (xp.level * 500)) * 100) : 0;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 220 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 glass border-r border-white/5 z-40 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-lg flex-shrink-0"
          >
            👔
          </motion.div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <div className="font-display font-800 text-white text-sm leading-tight">Routine</div>
              <div className="font-display font-800 gradient-text text-lg leading-tight -mt-1">{settings.userName || 'Michael'}</div>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
          >
            {collapsed ? <RiMenuLine size={16} /> : <RiCloseLine size={16} />}
          </button>
        </div>

        {/* User XP Badge */}
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-sm">
                {getLevelEmoji(xp.level)}
              </div>
              <div>
                <div className="text-white text-xs font-medium">{settings.userName || 'Michael'}</div>
                <div className="text-white/50 text-xs">Level {xp.level}</div>
              </div>
              <div className="ml-auto text-neon-cyan text-xs font-mono">{xp.xp} XP</div>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full xp-bar rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;
            return (
              <motion.button
                key={id}
                onClick={() => setActivePage(id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  active
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/10 text-neon-cyan border border-neon-cyan/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
                {active && !collapsed && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {settings.theme === 'dark' ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            {!collapsed && <span className="text-sm">{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav px-2 py-2">
        <div className="flex justify-around">
          {NAV_ITEMS.slice(0, 5).map(({ id, label, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active ? 'text-neon-cyan' : 'text-white/40'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px]">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function getLevelEmoji(level) {
  if (level < 3) return '🥚';
  if (level < 5) return '🐣';
  if (level < 8) return '🐤';
  if (level < 12) return '🦅';
  if (level < 20) return '🔥';
  return '👑';
}
