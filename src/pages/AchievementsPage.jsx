import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../data/motivationalMessages';
import { RiTrophyLine, RiLockLine } from 'react-icons/ri';

export default function AchievementsPage() {
  const { achievements, xpData } = useApp();

  const unlocked = achievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-white text-2xl lg:text-3xl">Achievements</h1>
        <p className="text-white/50 text-sm mt-0.5">
          {unlocked}/{total} unlocked · Level {xpData.level} · {xpData.totalXp} total XP
        </p>
      </motion.div>

      {/* Progress */}
      <div className="glass border border-white/10 rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Collection Progress</span>
          <span className="font-mono text-neon-cyan">{Math.round((unlocked / total) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #bf00ff, #00f5ff)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = achievements.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`glass border rounded-2xl p-4 text-center transition-all ${
                isUnlocked
                  ? 'border-neon-purple/30 bg-gradient-to-b from-neon-purple/10 to-transparent'
                  : 'border-white/5 opacity-50'
              }`}
            >
              <div className="relative inline-block">
                <span className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                  {ach.emoji}
                </span>
                {!isUnlocked && (
                  <RiLockLine className="absolute -top-1 -right-1 text-white/40" size={12} />
                )}
              </div>
              <p className={`font-display font-semibold text-sm mt-2 ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                {ach.name}
              </p>
              <p className="text-white/40 text-xs mt-0.5">{ach.desc}</p>
              <div className={`mt-2 px-2 py-0.5 rounded-full text-xs inline-block ${
                isUnlocked ? 'bg-neon-yellow/20 text-neon-yellow' : 'bg-white/5 text-white/30'
              }`}>
                +{ach.xp} XP
              </div>
            </motion.div>
          );
        })}
      </div>

      {unlocked === 0 && (
        <div className="text-center py-8">
          <RiTrophyLine className="mx-auto text-white/20 mb-3" size={40} />
          <p className="text-white/40">Complete tasks and build habits to earn badges!</p>
        </div>
      )}
    </div>
  );
}
