import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export default function XPBar({ compact = false }) {
  const { xpData } = useApp();
  const maxXP = xpData.level * 500;
  const progress = (xpData.xp / maxXP) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-neon-cyan">Lv.{xpData.level}</span>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-mono text-white/50">{xpData.xp}/{maxXP}</span>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-display font-bold text-white">Level {xpData.level}</p>
            <p className="text-xs text-white/50 font-body">{xpData.totalXp} total XP</p>
          </div>
        </div>
        <span className="font-mono text-sm text-neon-cyan">{xpData.xp} / {maxXP} XP</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ backgroundSize: '200% 100%' }} />
        </motion.div>
      </div>
      <p className="text-xs text-white/40 font-body mt-1">{Math.round(progress)}% to Level {xpData.level + 1}</p>
    </div>
  );
}
