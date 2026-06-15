'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/ui/toaster';

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: 'vital_signs', color: 'text-[#2E7D52]', bg: 'bg-[#E6F4EC]', title: 'Campaign delivered', body: 'New Menu Matchmaker — 98.7% delivery rate', time: '2h ago' },
  { id: 2, icon: 'bar_chart_4_bars', color: 'text-[#D95F2B]', bg: 'bg-[#F5E6DC]', title: 'Analytics ready', body: 'Spicy Comeback Window results are in', time: '5h ago' },
  { id: 3, icon: 'warning', color: 'text-[#A0660A]', bg: 'bg-[#FEF3DC]', title: 'Frequency cap hit', body: '72 customers skipped — cap resets in 3 days', time: '1d ago' },
  { id: 4, icon: 'auto_awesome', color: 'text-[#6B5D52]', bg: 'bg-[#F5F0E8]', title: 'New play suggestion', body: 'Craving Clock: 169 eligible customers right now', time: '1d ago' },
];

export function TopBar({ title, subtitle, action }: TopBarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unread, setUnread] = useState(2);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('deepseek');
  const [saved, setSaved] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSaveSettings() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <header className="sticky top-0 z-10 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E8E0D0] px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1410]">{title}</h1>
        {subtitle && <p className="text-xs text-[#A89880] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}

        {/* Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#A89880] text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search campaigns..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') showToast('Global search is coming soon!', 'info');
            }}
            className="bg-white border border-[#E8E0D0] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#1A1410] placeholder-[#A89880] focus:outline-none focus:ring-2 focus:ring-[#D95F2B]/20 focus:border-[#D95F2B] w-48 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowSettings(false); setUnread(0); }}
            className="relative text-[#A89880] hover:text-[#1A1410] transition-colors p-1.5 rounded-lg hover:bg-[#F5F0E8]"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D95F2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E8E0D0] rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E0D0] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A1410]">Notifications</span>
                <span className="text-xs text-[#A89880]">Mark all read</span>
              </div>
              <div className="divide-y divide-[#F5F0E8]">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAF7F2] transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={`material-symbols-outlined text-[16px] ${n.color}`}>{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1410]">{n.title}</p>
                      <p className="text-xs text-[#6B5D52] mt-0.5 truncate">{n.body}</p>
                    </div>
                    <span className="text-xs text-[#A89880] flex-shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#E8E0D0]">
                <Link href="/campaigns" className="text-xs text-[#D95F2B] hover:underline font-medium">View all activity →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => { setShowSettings(v => !v); setShowNotifs(false); }}
            className="text-[#A89880] hover:text-[#1A1410] transition-colors p-1.5 rounded-lg hover:bg-[#F5F0E8]"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E8E0D0] rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E0D0]">
                <span className="text-sm font-semibold text-[#1A1410]">Settings</span>
              </div>
              <div className="p-4 space-y-4">
                {/* AI Provider */}
                <div>
                  <label className="text-xs font-medium text-[#6B5D52] uppercase tracking-widest block mb-2">AI Provider</label>
                  <div className="flex gap-2">
                    {['deepseek', 'gemini'].map(p => (
                      <button
                        key={p}
                        onClick={() => setApiProvider(p)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          apiProvider === p
                            ? 'bg-[#F5E6DC] border-[#D95F2B] text-[#D95F2B]'
                            : 'bg-white border-[#E8E0D0] text-[#6B5D52] hover:bg-[#F5F0E8]'
                        }`}
                      >
                        {p === 'deepseek' ? 'DeepSeek' : 'Gemini'}
                      </button>
                    ))}
                  </div>
                  {apiProvider === 'deepseek' && (
                    <p className="text-xs text-[#2E7D52] mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Cheapest — ~$0.14/M tokens
                    </p>
                  )}
                </div>

                {/* API Key */}
                <div>
                  <label className="text-xs font-medium text-[#6B5D52] uppercase tracking-widest block mb-2">
                    {apiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini'} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={`sk-${apiProvider === 'deepseek' ? 'deepseek' : 'gemini'}-...`}
                    className="w-full text-xs bg-[#FAF7F2] border border-[#E8E0D0] rounded-lg px-3 py-2 text-[#1A1410] placeholder-[#A89880] focus:outline-none focus:ring-2 focus:ring-[#D95F2B]/20 focus:border-[#D95F2B]"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-[#E8E0D0] pt-3">
                  <label className="text-xs font-medium text-[#6B5D52] uppercase tracking-widest block mb-2">Services</label>
                  <div className="space-y-1.5">
                    {[
                      { label: 'CRM Backend', url: 'http://localhost:3000', ok: true },
                      { label: 'Channel Service', url: 'http://localhost:3001', ok: true },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="text-[#6B5D52]">{s.label}</span>
                        <span className={`flex items-center gap-1 font-medium ${s.ok ? 'text-[#2E7D52]' : 'text-[#C0392B]'}`}>
                          <span className="material-symbols-outlined text-[12px]">{s.ok ? 'check_circle' : 'error'}</span>
                          {s.ok ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-[#D95F2B] hover:bg-[#C4501F] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  {saved ? '✓ Saved' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#D95F2B] text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-[#C4501F] transition-colors">
          KB
        </div>
      </div>
    </header>
  );
}
