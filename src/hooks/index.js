// RoutineBoss Custom Hooks

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── useToday ─────────────────────────────────────────────────────────────────
// Returns today's date info, updates every second
export function useToday() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toISOString().split('T')[0]; // "2025-01-15"
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const hour = now.getHours();
  const timeSection =
    hour >= 4 && hour < 7 ? 'early_morning' :
    hour >= 7 && hour < 12 ? 'morning' :
    hour >= 12 && hour < 17 ? 'afternoon' :
    hour >= 17 && hour < 21 ? 'evening' : 'night';

  return { now, dateStr, dayName, dateFormatted, timeFormatted, timeSection };
}

// ─── usePomodoro ──────────────────────────────────────────────────────────────
// Full Pomodoro timer logic: work / short break / long break
export function usePomodoro({ onComplete } = {}) {
  const MODES = {
    work:       { label: 'Focus',       duration: 25 * 60, color: '#00f5ff' },
    shortBreak: { label: 'Short Break', duration: 5 * 60,  color: '#39ff14' },
    longBreak:  { label: 'Long Break',  duration: 15 * 60, color: '#bf00ff' },
  };

  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const currentMode = MODES[mode];

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setIsRunning(false);
        clearInterval(intervalRef.current);
        // Cycle: after work session, go to break
        setSessions(s => {
          const newS = mode === 'work' ? s + 1 : s;
          if (mode === 'work') {
            const nextMode = (newS % 4 === 0) ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
            setTimeLeft(MODES[nextMode].duration);
          } else {
            setMode('work');
            setTimeLeft(MODES.work.duration);
          }
          onComplete?.(mode, newS);
          return newS;
        });
        return 0;
      }
      return prev - 1;
    });
  }, [mode, onComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, tick]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(currentMode.duration);
  };
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const progress = 1 - timeLeft / currentMode.duration;

  return { mode, modes: MODES, currentMode, timeLeft, minutes, seconds, isRunning, sessions, progress, start, pause, reset, switchMode };
}

// ─── useVoiceInput ────────────────────────────────────────────────────────────
// Browser Web Speech API for voice task input
export function useVoiceInput({ onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        setTranscript(text);
        if (e.results[0].isFinal) {
          onResult?.(text);
          setIsListening(false);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [onResult]);

  const start = () => {
    if (!supported) return;
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stop = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  return { isListening, transcript, supported, start, stop };
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
// Simple hook for getting/setting a localStorage key with React state
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newValue) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      console.error('localStorage write failed');
    }
  }, [key]);

  return [value, set];
}

// ─── useKeyboardShortcuts ─────────────────────────────────────────────────────
// Global keyboard shortcut handler
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      // Don't fire inside inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');

      const action = shortcuts[key] || shortcuts[e.key.toLowerCase()];
      if (action) {
        e.preventDefault();
        action(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

// ─── useCountUp ───────────────────────────────────────────────────────────────
// Animated number counter
export function useCountUp(target, duration = 800) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const steps = 40;
    const increment = target / steps;
    const intervalMs = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [target, duration]);

  return current;
}
