import { motion } from 'framer-motion';
import { usePomodoro } from '../hooks';
import { RiPlayLine, RiPauseLine, RiRestartLine } from 'react-icons/ri';

export default function PomodoroPage() {
  const { mode, timeLeft, isRunning, sessions, progress, start, pause, reset, switchMode, displayTime } = usePomodoro();

  const MODES = [
    { id: 'work', label: 'Focus', emoji: '🎯', color: '#00f5ff', duration: '25 min' },
    { id: 'break', label: 'Break', emoji: '☕', color: '#00ff88', duration: '5 min' },
    { id: 'longbreak', label: 'Long Break', emoji: '😴', color: '#bf00ff', duration: '15 min' },
  ];

  const currentMode = MODES.find(m => m.id === mode) || MODES[0];
  const circumference = 2 * Math.PI * 90;
  const offset = circumference * (1 - progress);

  const TIPS = [
    "🧠 Focus on one task at a time.",
    "📵 Put your phone face-down during focus sessions.",
    "💧 Stay hydrated between sessions!",
    "🎧 Instrumental music can boost focus.",
    "📝 Write down distractions instead of acting on them.",
    "🏃 Stretch during your breaks.",
    "😤 One pomodoro at a time. You've got this.",
  ];

  const tip = TIPS[sessions % TIPS.length];

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 flex flex-col items-center space-y-6">
      <div className="text-center">
        <h1 className="font-display font-800 text-white text-2xl lg:text-3xl">Pomodoro Timer</h1>
        <p className="text-white/50 text-sm">Focus hard. Rest well. Repeat. 🔁</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 glass border border-white/10 rounded-2xl p-1.5">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              mode === m.id
                ? 'font-600 text-dark-900'
                : 'text-white/50 hover:text-white'
            }`}
            style={mode === m.id ? { background: m.color } : {}}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Timer Ring */}
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Track */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${currentMode.color})` }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={displayTime}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="font-mono font-700 text-4xl text-white"
          >
            {displayTime}
          </motion.div>
          <div className="text-white/50 text-sm mt-1">{currentMode.emoji} {currentMode.label}</div>
          <div className="text-white/30 text-xs">{currentMode.duration}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <RiRestartLine size={20} />
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? pause : start}
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-600 text-dark-900 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}aa)` }}
        >
          {isRunning ? <RiPauseLine size={28} /> : <RiPlayLine size={28} />}
        </motion.button>
        <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <div className="font-mono text-white text-sm font-700">{sessions}</div>
            <div className="text-white/40 text-[10px]">done</div>
          </div>
        </div>
      </div>

      {/* Session counter */}
      <div className="flex gap-2">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < (sessions % 4) ? 'bg-neon-cyan' :
              i === (sessions % 4) && isRunning && mode === 'work' ? 'bg-neon-cyan/40 animate-pulse' :
              'bg-white/10'
            }`}
          />
        ))}
        <span className="text-white/30 text-xs ml-1">{Math.floor(sessions / 4)} long breaks taken</span>
      </div>

      {/* Tip */}
      <div className="glass border border-white/8 rounded-2xl p-4 max-w-sm text-center">
        <p className="text-white/60 text-sm">{tip}</p>
      </div>

      {/* Focus mode info */}
      <div className="glass border border-white/8 rounded-2xl p-4 w-full max-w-sm">
        <h3 className="text-white/70 text-xs font-600 mb-3">POMODORO TECHNIQUE</h3>
        <div className="space-y-2 text-xs text-white/50">
          <div className="flex justify-between"><span>🎯 Focus session</span><span className="text-neon-cyan">25 min</span></div>
          <div className="flex justify-between"><span>☕ Short break</span><span className="text-neon-green">5 min</span></div>
          <div className="flex justify-between"><span>😴 Long break</span><span className="text-neon-purple">15 min</span></div>
          <div className="flex justify-between"><span>🔁 After 4 sessions</span><span className="text-neon-orange">→ Long break</span></div>
        </div>
      </div>
    </div>
  );
}
