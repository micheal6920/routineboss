import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const typeConfig = {
  success: { bg: 'bg-emerald-500/20 border-emerald-500/50', icon: '✅', text: 'text-emerald-300' },
  error: { bg: 'bg-red-500/20 border-red-500/50', icon: '❌', text: 'text-red-300' },
  info: { bg: 'bg-blue-500/20 border-blue-500/50', icon: 'ℹ️', text: 'text-blue-300' },
  xp: { bg: 'bg-yellow-500/20 border-yellow-500/50', icon: '⚡', text: 'text-yellow-300' },
  achievement: { bg: 'bg-purple-500/20 border-purple-500/50', icon: '🏆', text: 'text-purple-300' },
};

export default function Notification() {
  const { notification } = useApp();
  const config = typeConfig[notification?.type] || typeConfig.success;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md ${config.bg} max-w-xs`}
        >
          <p className={`font-body font-medium text-sm ${config.text}`}>
            {config.icon} {notification.msg}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
