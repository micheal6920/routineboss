import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export default function Confetti() {
  const { showConfetti } = useApp();
  const fired = useRef(false);

  useEffect(() => {
    if (showConfetti && !fired.current) {
      fired.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5ff', '#bf00ff', '#00ff88', '#ffdd00', '#ff006e'],
      });
      setTimeout(() => { fired.current = false; }, 3500);
    } else if (!showConfetti) {
      fired.current = false;
    }
  }, [showConfetti]);

  return null;
}
