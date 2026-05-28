// EmailJS reminder service for RoutineBoss
// Sends email alerts 1 hour before uncompleted tasks

import emailjs from '@emailjs/browser';
import { settingsStorage, taskStorage } from '../utils/storage';

let reminderCheckInterval = null;

/**
 * Send a reminder email for a task
 */
export async function sendReminderEmail(task) {
  const settings = settingsStorage.get();
  const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey, userEmail, userName } = settings;

  if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey || !userEmail) {
    console.warn('EmailJS not configured — skipping email reminder');
    return false;
  }

  try {
    await emailjs.send(
      emailjsServiceId,
      emailjsTemplateId,
      {
        to_email: userEmail,
        to_name: userName || 'Michael',
        task_name: task.title,
        task_time: task.time,
        task_category: task.category || 'general',
        task_emoji: task.emoji || '📌',
        message: `Hey ${userName || 'Michael'}! Don't forget: "${task.title}" is due at ${task.time} today. Get to it! 💪`,
      },
      emailjsPublicKey
    );
    console.log(`📧 Reminder sent for: ${task.title}`);
    return true;
  } catch (err) {
    console.error('EmailJS send failed:', err);
    return false;
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return Notification.permission === 'granted';
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(title, body, icon = '🔥') {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`${icon} ${title}`, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }
}

/**
 * Play a notification sound
 */
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(990, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not supported — silent fail
  }
}

/**
 * Play a completion/success sound
 */
export function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // Silent fail
  }
}

/**
 * Check tasks every minute and fire reminders 1 hour before
 */
export function startReminderLoop(onReminderFired) {
  if (reminderCheckInterval) clearInterval(reminderCheckInterval);

  const check = () => {
    const settings = settingsStorage.get();
    if (!settings.notifications) return;

    const tasks = taskStorage.getAll();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowMins = now.getHours() * 60 + now.getMinutes();

    tasks.forEach(task => {
      if (task.completed || !task.time) return;
      const taskDate = task.date || todayStr;
      const isToday = taskDate === todayStr || task.repeat === 'daily';
      if (!isToday) return;

      const [h, m] = task.time.split(':').map(Number);
      const taskMins = h * 60 + m;
      const diff = taskMins - nowMins;

      // Fire reminder at exactly 60 mins before (within 1 min window)
      if (diff >= 59 && diff <= 61) {
        const reminderKey = `reminder_${task.id}_${todayStr}`;
        if (!sessionStorage.getItem(reminderKey)) {
          sessionStorage.setItem(reminderKey, '1');
          showBrowserNotification(
            `⏰ Upcoming: ${task.emoji || ''} ${task.title}`,
            `Starting in 1 hour at ${task.time}. Don't be late!`
          );
          if (settings.sounds) playNotificationSound();
          sendReminderEmail(task);
          onReminderFired?.(task);
        }
      }

      // Fire a 5-min warning too
      if (diff >= 4 && diff <= 6) {
        const reminderKey = `reminder5_${task.id}_${todayStr}`;
        if (!sessionStorage.getItem(reminderKey)) {
          sessionStorage.setItem(reminderKey, '1');
          showBrowserNotification(
            `🚨 5 minutes: ${task.emoji || ''} ${task.title}`,
            `Starting in 5 minutes at ${task.time}. Get ready!`
          );
          if (settings.sounds) playNotificationSound();
        }
      }
    });
  };

  check(); // Run immediately
  reminderCheckInterval = setInterval(check, 60_000); // Then every minute
  return () => clearInterval(reminderCheckInterval);
}

export function stopReminderLoop() {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
    reminderCheckInterval = null;
  }
}
