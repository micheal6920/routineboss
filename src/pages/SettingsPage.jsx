import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import {
  RiUser3Line, RiBellLine, RiPaletteLine, RiDownloadLine,
  RiUploadLine, RiDeleteBinLine, RiMailLine, RiSoundModuleLine
} from 'react-icons/ri';

function Section({ title, icon, children }) {
  return (
    <div className="glass border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-neon-cyan">{icon}</span>
        <h2 className="font-display font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-white/80 text-sm">{label}</p>
        {desc && <p className="text-white/40 text-xs">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-neon-cyan' : 'bg-white/10'}`}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-5 h-5 rounded-full bg-white absolute top-0.5"
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, showNotification, theme, toggleTheme } = useApp();
  const [saved, setSaved] = useState(false);

  const handleExport = () => {
    const data = storage.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routineboss-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📦 Backup exported!', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        storage.import(data);
        showNotification('✅ Data imported! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showNotification('❌ Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ This will delete ALL your data. Are you sure?')) {
      storage.clear();
      showNotification('🗑️ All data cleared', 'info');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const saveSettings = () => {
    setSaved(true);
    showNotification('✅ Settings saved!', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-white text-2xl lg:text-3xl">Settings</h1>
        <p className="text-white/50 text-sm">Customize your RoutineBoss experience</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Profile" icon={<RiUser3Line size={18} />}>
          <div className="space-y-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Your Name</label>
              <input
                type="text"
                value={settings.userName || ''}
                onChange={e => updateSettings({ userName: e.target.value })}
                placeholder="What should I call you, Michael?"
                className="neon-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Email (for reminders)</label>
              <input
                type="email"
                value={settings.userEmail || ''}
                onChange={e => updateSettings({ userEmail: e.target.value })}
                placeholder="your@email.com"
                className="neon-input w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Preferences" icon={<RiPaletteLine size={18} />}>
          <Toggle
            label="Dark Mode"
            value={theme === 'dark'}
            onChange={() => toggleTheme()}
            desc="Switch between dark and light theme"
          />
          <Toggle
            label="Browser Notifications"
            value={settings.notifications ?? true}
            onChange={v => updateSettings({ notifications: v })}
            desc="Get reminders in your browser"
          />
          <Toggle
            label="Sound Effects"
            value={settings.sounds ?? true}
            onChange={v => updateSettings({ sounds: v })}
            desc="Play sounds on task completion"
          />
          <div className="pt-2">
            <label className="text-white/50 text-xs mb-2 block">Motivation Style</label>
            <div className="flex gap-2">
              {['roast', 'friendly'].map(mode => (
                <button
                  key={mode}
                  onClick={() => updateSettings({ motivationMode: mode })}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all border ${
                    settings.motivationMode === mode
                      ? 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan'
                      : 'glass border-white/10 text-white/50'
                  }`}
                >
                  {mode === 'roast' ? '🔥 Roast Me' : '🤗 Be Nice'}
                </button>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-1">
              {settings.motivationMode === 'roast' ? 'Brutal honesty. You asked for it.' : 'Supportive and encouraging vibes.'}
            </p>
          </div>
        </Section>
      </motion.div>

      {/* EmailJS */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Email Reminders (EmailJS)" icon={<RiMailLine size={18} />}>
          <p className="text-white/40 text-xs mb-3">
            Get email reminders for upcoming tasks. Free setup at <span className="text-neon-cyan">emailjs.com</span>
          </p>
          {[
            { key: 'emailjsServiceId', label: 'Service ID', placeholder: 'service_xxxxxxx' },
            { key: 'emailjsTemplateId', label: 'Template ID', placeholder: 'template_xxxxxxx' },
            { key: 'emailjsPublicKey', label: 'Public Key', placeholder: 'your_public_key' },
          ].map(field => (
            <div key={field.key} className="mb-3">
              <label className="text-white/50 text-xs mb-1 block">{field.label}</label>
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={e => updateSettings({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="neon-input w-full rounded-xl px-3 py-2 text-sm font-mono"
              />
            </div>
          ))}
        </Section>
      </motion.div>

      {/* Data */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Section title="Data Management" icon={<RiDownloadLine size={18} />}>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-neon-cyan/30 transition-all text-sm"
            >
              <RiDownloadLine size={18} className="text-neon-cyan" />
              Export Backup (JSON)
            </button>
            <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-neon-green/30 transition-all text-sm cursor-pointer">
              <RiUploadLine size={18} className="text-neon-green" />
              Import Backup (JSON)
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleClearData}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass border border-neon-pink/20 text-neon-pink/70 hover:text-neon-pink hover:border-neon-pink/40 transition-all text-sm"
            >
              <RiDeleteBinLine size={18} />
              Clear All Data (⚠️ Irreversible)
            </button>
          </div>
        </Section>
      </motion.div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-white/20 text-xs font-mono">RoutineBoss v1.0.0 · Built with ❤️ & Framer Motion</p>
      </div>
    </div>
  );
}
