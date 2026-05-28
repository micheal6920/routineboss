import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getMotivationalMessage } from '../../data/messages';

export default function Mascot() {
  const { xpData: xp, settings } = useApp();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [mood, setMood] = useState('happy');

  const level = xp?.level || 1;

  const pets = [
    { minLevel: 1, emoji: '🐣', name: 'Chippy' },
    { minLevel: 3, emoji: '🐤', name: 'Zippy' },
    { minLevel: 6, emoji: '🦊', name: 'Foxi' },
    { minLevel: 10, emoji: '🐺', name: 'Wolfi' },
    { minLevel: 15, emoji: '🦅', name: 'Eagle' },
    { minLevel: 20, emoji: '🐉', name: 'Drago' },
  ];

  const currentPet = [...pets].reverse().find(p => level >= p.minLevel) || pets[0];

  const greetings = [
    "Let's crush it today! 💪",
    "You're doing amazing! ✨",
    "Another task? Easy for you! 🚀",
    "I believe in you, boss! 👑",
    "Keep that streak alive! 🔥",
    "You're on fire today! 🌟",
    "Productivity level: MAXIMUM! ⚡",
  ];

  const handleClick = () => {
    const msg = Math.random() > 0.3
      ? greetings[Math.floor(Math.random() * greetings.length)]
      : getMotivationalMessage('general', settings.motivationMode || 'roast');
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="glass border border-neon-cyan/20 rounded-2xl rounded-br-none p-3 max-w-48 text-xs text-white/90"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-2xl glass border border-neon-cyan/20 flex items-center justify-center text-2xl cursor-pointer shadow-lg"
        title={`${currentPet.name} - Click me!`}
      >
        {currentPet.emoji}
      </motion.button>
    </div>
  );
}
