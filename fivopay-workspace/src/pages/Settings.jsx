import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import {
  Layout, Calendar, BarChart3, Settings as SettingsIcon, Rocket,
  User, Moon, Sun, Lock, LogOut, Save, Shield, Mail, Camera,
  Globe, HelpCircle, Info, Trash2, Monitor
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick, t }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 mx-2 transition-all duration-200 rounded-lg font-medium text-sm ${
      active
        ? 'shadow-lg'
        : ''
    }`}
    style={active ? { backgroundColor: '#06B6D4', color: '#FFFFFF' } : { color: '#475569' }}
  >
    <Icon className={`w-5 h-5`} />
    <span>{t(label)}</span>
  </button>
);

const Sidebar = ({ user, onLogout, navigate, t }) => (
  <aside className="w-80 h-screen flex flex-col shrink-0 z-20" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #D1FAE5' }}>
    <div className="p-10 flex items-center justify-between border-b" style={{ borderBottom: '1px solid #D1FAE5' }}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-300/50 text-white" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
          <Rocket className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>FivoPay</h2>
          <p className="text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Settings</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto">
      <div className="px-10 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Main Menu</p>
      </div>
      <SidebarItem icon={Layout} label="dashboard" onClick={() => navigate('/dashboard')} t={t} />
      <SidebarItem icon={Calendar} label="planner" onClick={() => navigate('/planner')} t={t} />
      <SidebarItem icon={BarChart3} label="analytics" onClick={() => navigate('/analytics')} t={t} />
      <SidebarItem icon={SettingsIcon} label="settings" active onClick={() => {}} t={t} />
    </nav>

    <div className="p-8 mt-auto">
      <div className="rounded-[32px] p-6 flex items-center gap-5 border shadow-sm transition-all duration-500" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#06B6D4' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#D1FAE5' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
          {user?.name?.[0] || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate" style={{ color: '#0F172A' }}>{user?.name}</p>
          <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: '#94A3B8' }}>Sign Out</button>
        </div>
      </div>
    </div>
  </aside>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState(localStorage.getItem('fivopay_theme') || 'dark');
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Apply theme dynamically
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const autoSaveSettings = async (newTheme, newLanguage) => {
    try {
      localStorage.setItem('fivopay_theme', newTheme);
      localStorage.setItem('fivopay_language', newLanguage);
      
      await authService.updateProfile({
        id: user.id,
        name,
        email,
        settings: { theme: newTheme, language: newLanguage, notifications }
      });
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleThemeChange = (e) => {
    const val = e.target.value;
    setTheme(val);
    autoSaveSettings(val, language);
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    changeLanguage(val);
    autoSaveSettings(theme, val);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem('fivopay_theme', theme);
      localStorage.setItem('fivopay_language', language);
      
      await authService.updateProfile({
        id: user.id,
        name,
        email,
        settings: { theme, language, notifications }
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: '#ECFEFF', color: '#0F172A' }}>
      <Sidebar user={user} onLogout={handleLogout} navigate={navigate} t={t} />

      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">

          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#0F172A' }}>{t('accountSettings')}</h1>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>{t('manageProfilePreferencesSecurity')}</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg"
              style={{ backgroundColor: loading ? '#94A3B8' : '#06B6D4' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0891B2')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#06B6D4')}
            >
              <Save className="w-4 h-4" />
              {loading ? t('loading') : t('save')}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Settings Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Profile Section */}
              <section className="bg-white rounded-xl p-6 border shadow-sm mb-6" style={{ borderColor: '#D1FAE5' }}>
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5" style={{ color: '#06B6D4' }} />
                  <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('profile')}</h2>
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                      {name.charAt(0) || 'U'}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#0F172A' }}>{name || 'User'}</h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>{email || 'user@example.com'}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>{t('name') || 'Full Name'}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all font-medium"
                        style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(6, 182, 212, 0.2)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>{t('email') || 'Email Address'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 transition-all"
                        style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.2)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* General Settings */}
              <section className="bg-white rounded-xl p-6 border shadow-sm mb-6" style={{ borderColor: '#D1FAE5' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-5 h-5" style={{ color: '#06B6D4' }} />
                  <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('generalSettings')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Select */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>{t('theme')}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4" style={{ color: '#94A3B8' }}>
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </div>
                      <select 
                        value={theme}
                        onChange={handleThemeChange}
                        className="w-full rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer"
                        style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.2)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>

                  {/* Language Select */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>{t('language')}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4" style={{ color: '#94A3B8' }}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <select 
                        value={language}
                        onChange={handleLanguageChange}
                        className="w-full rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer"
                        style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5', color: '#0F172A' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.2)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <option value="en">English</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Sidebar Settings */}
            <div className="space-y-8">
              
              {/* Preferences */}
              <section className="bg-white rounded-xl p-6 border shadow-sm mb-6" style={{ borderColor: '#D1FAE5' }}>
                <div className="flex items-center gap-3 mb-6">
                  <SettingsIcon className="w-5 h-5" style={{ color: '#06B6D4' }} />
                  <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('preferences')}</h2>
                </div>

                <div className="space-y-6">

                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{t('notifications')}</p>
                      <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Email alerts & pushes</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(!notifications)}
                      className="w-14 h-7 rounded-full p-1 transition-colors"
                      style={{ backgroundColor: notifications ? '#06B6D4' : '#D1FAE5' }}
                    >
                      <div className="w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: notifications ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Support & About */}
              <section className="bg-white rounded-3xl p-8 border shadow-xl" style={{ borderColor: '#D1FAE5' }}>
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="w-full flex items-center justify-between p-4 border rounded-xl transition-all group"
                    style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#06B6D4' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#D1FAE5' }}
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5" style={{ color: '#06B6D4' }} />
                      <span className="font-bold text-sm transition-colors" style={{ color: '#475569' }}>About Fivopay Workspace</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="rounded-xl p-6 border shadow-sm mb-6" style={{ backgroundColor: '#F8FAFC', borderColor: '#D1FAE5' }}>
                <div className="flex items-center gap-3 mb-4">
                  <LogOut className="w-5 h-5" style={{ color: '#EF4444' }} />
                  <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Account Session</h2>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border shadow-sm"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5', color: '#EF4444' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1FAE5'; e.currentTarget.style.color = '#EF4444' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                  
                  <div className="h-px w-full bg-rose-200 my-4" />

                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                        console.log('Account deleted');
                      }
                    }}
                    className="w-full py-3 bg-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </section>
              
            </div>
          </div>
        </div>
      </main>

      {/* About Fivopay Workspace Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-300" style={{ backgroundColor: '#FFFFFF' }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-white mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                <Rocket className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: '#0F172A' }}>FivoPay Workspace</h2>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Version 1.0.0</p>
            </div>

            <div className="space-y-4 text-sm" style={{ color: '#475569' }}>
              <p className="leading-relaxed">
                <strong style={{ color: '#0F172A' }}>FivoPay Workspace</strong> is a comprehensive task management and project collaboration platform designed to streamline your team's workflow and boost productivity.
              </p>
              
              <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#F8FAFC' }}>
                <h3 className="font-bold text-sm" style={{ color: '#0F172A' }}>Key Features:</h3>
                <ul className="space-y-2 text-sm" style={{ color: '#475569' }}>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#06B6D4' }}>•</span>
                    <span>Task Management with drag-and-drop interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#06B6D4' }}>•</span>
                    <span>Employee performance tracking & analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#06B6D4' }}>•</span>
                    <span>Real-time collaboration & checklist items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#06B6D4' }}>•</span>
                    <span>Due date tracking with overdue notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#06B6D4' }}>•</span>
                    <span>Comprehensive dashboard & reporting</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
                <p className="font-medium text-center" style={{ color: '#06B6D4' }}>
                  Built with React, Node.js & PostgreSQL
                </p>
              </div>

              <p className="text-xs text-center pt-2" style={{ color: '#94A3B8' }}>
                © 2026 FivoPay Workspace. All rights reserved.
              </p>
            </div>

            {/* Close Button at Bottom */}
            <button 
              onClick={() => setShowAboutModal(false)}
              className="w-full mt-6 py-3 text-white font-bold rounded-xl transition-colors"
              style={{ backgroundColor: '#06B6D4' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0891B2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06B6D4'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
