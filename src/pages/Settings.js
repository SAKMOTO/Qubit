import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Globe, Type, Bug, Save, RotateCcw, Upload, Download, Image as ImageIcon, X, Home, Archive, Sun, Moon, Monitor, Bell, Check, ChevronDown, ArrowLeft } from 'lucide-react';

// Constants
const LANGUAGES = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const DATE_FORMATS = [
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const TIME_FORMATS = [
  { id: '12h', label: '12-hour' },
  { id: '24h', label: '24-hour' },
];

const FONT_FAMILIES = [
  { id: 'Arial', name: 'Arial, sans-serif' },
  { id: 'Helvetica', name: 'Helvetica, Arial, sans-serif' },
  { id: 'Georgia', name: 'Georgia, serif' },
  { id: 'Times', name: 'Times New Roman, serif' },
  { id: 'Courier', name: 'Courier New, monospace' },
];

// Load settings from localStorage
const loadSettings = () => {
  const defaultSettings = {
    profile: {
      displayName: 'Qubit User',
      avatar: null,
      email: '',
    },
    language: {
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    typography: {
      fontSize: 16,
      fontFamily: 'Arial',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
    },
    theme: 'dark', // 'dark', 'light', or 'system'
    notifications: true,
  };

  try {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(loadSettings());
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [bugReport, setBugReport] = useState({
    subject: '',
    description: '',
    type: 'other',
    severity: 'medium',
    steps: '',
    expected: '',
    actual: '',
    screenshot: null,
  });
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const navigate = useNavigate();

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      setSaveStatus('Settings saved!');
      setTimeout(() => setSaveStatus(''), 3000);
      
      // Apply theme
      if (newSettings.theme === 'dark' || (newSettings.theme === 'system' && 
          window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      handleChange('profile', 'avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form field changes
  const handleChange = (section, field, value) => {
    const newSettings = {
      ...settings,
      [section]: { ...settings[section], [field]: value }
    };
    setSettings(newSettings);
    
    // Debounce the save to prevent too many writes
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveSettings(newSettings);
    }, 500);
  };

  // Handle bug report changes
  const handleBugReportChange = (field, value) => {
    setBugReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit bug report
  const submitBugReport = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Submitting bug report:', bugReport);
    alert('Thank you for your feedback! We\'ll look into this issue.');
    setBugReport({
      subject: '',
      description: '',
      type: 'other',
      severity: 'medium',
      steps: '',
      expected: '',
      actual: '',
      screenshot: null,
    });
  };

  // Apply typography settings
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${settings.typography.fontSize}px`);
    document.documentElement.style.setProperty('--font-family', settings.typography.fontFamily);
    document.documentElement.style.setProperty('--line-height', settings.typography.lineHeight);
    document.documentElement.style.setProperty('--letter-spacing', `${settings.typography.letterSpacing}px`);
  }, [settings.typography]);

  // Apply accessibility settings
  useEffect(() => {
    if (settings.accessibility.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (settings.accessibility.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [settings.accessibility]);

  // Initialize theme
  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (settings.theme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    };

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Use addEventListener instead of the deprecated addListener
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Initial theme setup
    if (settings.theme === 'dark' || (settings.theme === 'system' && darkModeMediaQuery.matches)) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Cleanup function
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings.theme]);

  // Navigation tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'language', label: 'Language & Region', icon: <Globe size={18} /> },
    { id: 'display', label: 'Display', icon: <Type size={18} /> },
    { id: 'bug', label: 'Report a Bug', icon: <Bug size={18} /> },
  ];

  // Theme options
  const themeOptions = [
    { id: 'light', label: 'Light', icon: <Sun size={16} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { id: 'system', label: 'System', icon: <Monitor size={16} /> },
  ];

  let saveTimeout;

  return (
    <div className="settings-page" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingTop: '5rem',
      position: 'relative',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 1000
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            '&:hover': {
              background: 'var(--bg-hover)'
            }
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>
      </div>
      <h1 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: 'var(--text-primary)',
        paddingTop: '4rem'  // Add padding to account for fixed header
      }}>
        <SettingsIcon size={28} /> Settings
      </h1>
      
      {saveStatus && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'var(--accent)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Check size={18} /> {saveStatus}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '2rem',
        marginTop: '2rem',
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: '240px',
          flexShrink: 0,
        }}>
          <nav>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: activeTab === tab.id ? 'var(--accent-light)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: activeTab === tab.id ? 'var(--accent-light)' : 'var(--bg-hover)',
                      },
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>App Version</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Qubit v1.0.0</span>
              <button 
                onClick={() => alert('Checking for updates...')}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'var(--bg-hover)',
                  },
                }}
              >
                Check for Updates
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '2rem',
          minHeight: '70vh',
          border: '1px solid var(--border)',
        }}>
          {activeTab === 'profile' && (
            <div className="profile-settings">
              <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Profile Settings</h2>
              
              <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}>
                <div>
                  <h3>Profile Picture</h3>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '1rem',
                    border: '2px solid var(--border)',
                  }}>
                    {avatarPreview || settings.profile.avatar ? (
                      <img 
                        src={avatarPreview || settings.profile.avatar} 
                        alt="Profile" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <User size={48} color="var(--text-secondary)" />
                    )}
                    <label style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      textAlign: 'center',
                      padding: '0.25rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}>
                      <Upload size={14} /> Change
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <button 
                    onClick={() => {
                      setAvatarPreview(null);
                      handleChange('profile', 'avatar', null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.5rem',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => handleChange('profile', 'displayName', e.target.value)}
                      maxLength={30}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                    />
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      marginTop: '0.25rem',
                      textAlign: 'right',
                      color: 'var(--text-secondary)',
                    }}>
                      {settings.profile.displayName.length}/30 characters
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleChange('profile', 'email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginTop: '2rem',
                border: '1px solid var(--border)',
              }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Account Actions</h3>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginTop: '1rem',
                }}>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--accent)',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'var(--accent-light-hover)',
                    },
                  }}>
                    <Download size={16} /> Export Data
                  </button>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--warning-border)',
                    background: 'var(--warning-bg)',
                    color: 'var(--warning-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'var(--warning-bg-hover)',
                    },
                  }}>
                    <RotateCcw size={16} /> Reset to Defaults
                  </button>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--danger-border)',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'var(--danger-bg-hover)',
                    },
                  }}>
                    <X size={16} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="language-settings">
              <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Language & Region</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem',
              }}>
                <div>
                  <h3>Language</h3>
                  <select
                    value={settings.language.language}
                    onChange={(e) => handleChange('language', 'language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      marginTop: '0.5rem',
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-light)',
                      },
                    }}
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                  }}>
                    <input
                      type="checkbox"
                      id="auto-detect"
                      checked={settings.language.language === 'auto'}
                      onChange={(e) => {
                        handleChange('language', 'language', e.target.checked ? 'auto' : 'en');
                      }}
                      style={{
                        marginRight: '0.5rem',
                        cursor: 'pointer',
                      }}
                    />
                    <label 
                      htmlFor="auto-detect" 
                      style={{ 
                        fontSize: '0.9rem', 
                        opacity: 0.9,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      Auto-detect language
                    </label>
                  </div>
                </div>

                <div>
                  <h3>Date Format</h3>
                  <select
                    value={settings.language.dateFormat}
                    onChange={(e) => handleChange('language', 'dateFormat', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      marginTop: '0.5rem',
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-light)',
                      },
                    }}
                  >
                    {DATE_FORMATS.map(format => (
                      <option key={format.id} value={format.id}>
                        {format.label} (e.g., {format.id === 'MM/DD/YYYY' ? '12/31/2024' : 
                                         format.id === 'DD/MM/YYYY' ? '31/12/2024' : '2024-12-31'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3>Time Format</h3>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}>
                    {TIME_FORMATS.map(format => (
                      <label 
                        key={format.id} 
                        style={{
                          flex: 1,
                          position: 'relative',
                        }}
                      >
                        <input
                          type="radio"
                          name="time-format"
                          value={format.id}
                          checked={settings.language.timeFormat === format.id}
                          onChange={() => handleChange('language', 'timeFormat', format.id)}
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            width: 0,
                            height: 0,
                          }}
                        />
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${
                            settings.language.timeFormat === format.id 
                              ? 'var(--accent)' 
                              : 'var(--border)'
                          }`,
                          backgroundColor: settings.language.timeFormat === format.id 
                            ? 'var(--accent-light)' 
                            : 'var(--bg-tertiary)',
                          color: settings.language.timeFormat === format.id 
                            ? 'var(--accent)' 
                            : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          '&:hover': {
                            borderColor: settings.language.timeFormat === format.id 
                              ? 'var(--accent)' 
                              : 'var(--border-hover)',
                            backgroundColor: settings.language.timeFormat === format.id 
                              ? 'var(--accent-light)' 
                              : 'var(--bg-hover)',
                          },
                        }}>
                          {format.label} ({format.id === '12h' ? '2:30 PM' : '14:30'})
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3>Timezone</h3>
                  <select
                    value={settings.language.timezone}
                    onChange={(e) => handleChange('language', 'timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      marginTop: '0.5rem',
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-light)',
                      },
                    }}
                  >
                    <option value="auto">Auto-detect ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                    <option disabled>──────────</option>
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
              }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Preview</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  marginTop: '1rem',
                }}>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</div>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}>
                      {(() => {
                        try {
                          // Try with the selected language, fallback to browser default if invalid
                          return new Date().toLocaleDateString(settings.language.language || undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          });
                        } catch (e) {
                          // If there's an error, use the browser's default locale
                          return new Date().toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          });
                        }
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Time</div>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}>
                      {(() => {
                        try {
                          // Try with the selected language, fallback to browser default if invalid
                          return new Date().toLocaleTimeString(settings.language.language || undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: settings.language.timeFormat === '12h',
                          });
                        } catch (e) {
                          // If there's an error, use the browser's default locale
                          return new Date().toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: settings.language.timeFormat === '12h',
                          });
                        }
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date & Time</div>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      border: '1px solid var(--border)',
                    }}>
                      {new Date().toLocaleString(settings.language.language, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: settings.language.timeFormat === '12h',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="display-settings">
              <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Display Settings</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem',
              }}>
                <div>
                  <h3>Theme</h3>
                  <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'var(--border-hover)',
                          backgroundColor: 'var(--bg-hover)',
                        },
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {settings.theme === 'light' && <Sun size={16} />}
                        {settings.theme === 'dark' && <Moon size={16} />}
                        {settings.theme === 'system' && <Monitor size={16} />}
                        <span>{String(settings.theme || 'system').charAt(0).toUpperCase() + String(settings.theme || 'system').slice(1)}</span>
                      </div>
                      <ChevronDown size={16} style={{
                        transition: 'transform 0.2s',
                        transform: showThemeDropdown ? 'rotate(180deg)' : 'rotate(0)',
                      }} />
                    </button>
                    
                    {showThemeDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        zIndex: 10,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                      }}>
                        {themeOptions.map(option => (
                          <button
                            key={option.id}
                            onClick={() => {
                              handleChange('theme', option.id);
                              setShowThemeDropdown(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: 'none',
                              background: 'transparent',
                              color: settings.theme === option.id ? 'var(--accent)' : 'var(--text-primary)',
                              fontSize: '1rem',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'var(--bg-hover)',
                              },
                            }}
                          >
                            {option.icon}
                            {option.label}
                            {settings.theme === option.id && (
                              <Check size={16} style={{ marginLeft: 'auto' }} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3>Font Size</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}>
                    <span style={{ minWidth: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A</span>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.typography.fontSize}
                      onChange={(e) => handleChange('typography', 'fontSize', parseInt(e.target.value))}
                      style={{
                        flex: 1,
                        height: '4px',
                        WebkitAppearance: 'none',
                        background: 'var(--border)',
                        borderRadius: '2px',
                        outline: 'none',
                        '&::-webkit-slider-thumb': {
                          WebkitAppearance: 'none',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          cursor: 'pointer',
                        },
                      }}
                    />
                    <span style={{ minWidth: '2.5rem', textAlign: 'right', fontSize: '1.1rem', color: 'var(--text-primary)' }}>A</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <span>Small</span>
                    <span>{settings.typography.fontSize}px</span>
                    <span>Large</span>
                  </div>
                </div>

                <div>
                  <h3>Font Family</h3>
                  <select
                    value={settings.typography.fontFamily}
                    onChange={(e) => handleChange('typography', 'fontFamily', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      marginTop: '0.5rem',
                      fontFamily: settings.typography.fontFamily,
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-light)',
                      },
                    }}
                  >
                    {FONT_FAMILIES.map(font => (
                      <option 
                        key={font.id} 
                        value={font.id}
                        style={{ fontFamily: font.name }}
                      >
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3>Line Height</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}>
                    <span style={{ minWidth: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>1.0</span>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={settings.typography.lineHeight}
                      onChange={(e) => handleChange('typography', 'lineHeight', parseFloat(e.target.value))}
                      style={{
                        flex: 1,
                        height: '4px',
                        WebkitAppearance: 'none',
                        background: 'var(--border)',
                        borderRadius: '2px',
                        outline: 'none',
                        '&::-webkit-slider-thumb': {
                          WebkitAppearance: 'none',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          cursor: 'pointer',
                        },
                      }}
                    />
                    <span style={{ minWidth: '2.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>3.0</span>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    Current: {settings.typography.lineHeight.toFixed(1)}
                  </div>
                </div>

                <div>
                  <h3>Notifications</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Bell size={20} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Enable Notifications</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Get updates and important notifications
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleChange('notifications', e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <span className="slider round" style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '44px',
                        height: '24px',
                        backgroundColor: settings.notifications ? 'var(--accent)' : 'var(--border)',
                        borderRadius: '24px',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          height: '20px',
                          width: '20px',
                          left: settings.notifications ? 'calc(100% - 22px)' : '2px',
                          bottom: '2px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s',
                        },
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
              }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Accessibility</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border)',
                    '&:hover': {
                      borderColor: 'var(--border-hover)',
                      backgroundColor: 'var(--bg-hover)',
                    },
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.accessibility.highContrast}
                      onChange={(e) => handleChange('accessibility', 'highContrast', e.target.checked)}
                      style={{
                        marginRight: '0.75rem',
                        marginTop: '0.25rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>High Contrast Mode</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                        Increases color contrast for better visibility
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border)',
                    '&:hover': {
                      borderColor: 'var(--border-hover)',
                      backgroundColor: 'var(--bg-hover)',
                    },
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.accessibility.reduceMotion}
                      onChange={(e) => handleChange('accessibility', 'reduceMotion', e.target.checked)}
                      style={{
                        marginRight: '0.75rem',
                        marginTop: '0.25rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Reduce Motion</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                        Reduces animations and transitions
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
              }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Preview</h3>
                <div style={{
                  marginTop: '1rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  fontFamily: settings.typography.fontFamily,
                  fontSize: `${settings.typography.fontSize}px`,
                  lineHeight: settings.typography.lineHeight,
                  letterSpacing: `${settings.typography.letterSpacing}px`,
                  border: '1px solid var(--border)',
                }}>
                  <h4 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Sample Text</h4>
                  <p style={{ margin: '1rem 0', color: 'var(--text-primary)' }}>
                    The quick brown fox jumps over the lazy dog. 1234567890
                  </p>
                  <p style={{ margin: '1rem 0', color: 'var(--text-primary)' }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    flexWrap: 'wrap',
                  }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      '&:hover': {
                        backgroundColor: 'var(--accent-hover)',
                      },
                    }}>
                      Primary Button
                    </button>
                    <button style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      '&:hover': {
                        backgroundColor: 'var(--bg-hover)',
                      },
                    }}>
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bug' && (
            <div className="bug-report">
              <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Report a Bug</h2>
              <p style={{ opacity: 0.9, marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Found an issue? Please let us know what happened and we'll look into it right away.
              </p>
              
              <form onSubmit={submitBugReport}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={bugReport.subject}
                      onChange={(e) => handleBugReportChange('subject', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                      placeholder="Briefly describe the issue"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Issue Type *
                    </label>
                    <select
                      value={bugReport.type}
                      onChange={(e) => handleBugReportChange('type', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                    >
                      <option value="crash">App Crash</option>
                      <option value="ui">UI Issue</option>
                      <option value="performance">Performance Problem</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Severity *
                    </label>
                    <select
                      value={bugReport.severity}
                      onChange={(e) => handleBugReportChange('severity', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                    >
                      <option value="low">Low - Minor issue, doesn't affect functionality</option>
                      <option value="medium">Medium - Some functionality affected</option>
                      <option value="high">High - Major functionality affected</option>
                      <option value="critical">Critical - App is unusable</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.9,
                    color: 'var(--text-primary)',
                  }}>
                    Description *
                  </label>
                  <textarea
                    value={bugReport.description}
                    onChange={(e) => handleBugReportChange('description', e.target.value)}
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      resize: 'vertical',
                      minHeight: '120px',
                      '&:focus': {
                        outline: 'none',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 0 2px var(--accent-light)',
                      },
                    }}
                    placeholder="Please describe the issue in detail..."
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Steps to Reproduce
                    </label>
                    <textarea
                      value={bugReport.steps}
                      onChange={(e) => handleBugReportChange('steps', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        resize: 'vertical',
                        minHeight: '80px',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                      placeholder="1. Go to...\n2. Click on...\n3. Scroll to..."
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Expected Behavior
                    </label>
                    <input
                      type="text"
                      value={bugReport.expected}
                      onChange={(e) => handleBugReportChange('expected', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        marginBottom: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                      placeholder="What did you expect to happen?"
                    />
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      color: 'var(--text-primary)',
                    }}>
                      Actual Behavior
                    </label>
                    <input
                      type="text"
                      value={bugReport.actual}
                      onChange={(e) => handleBugReportChange('actual', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        '&:focus': {
                          outline: 'none',
                          borderColor: 'var(--accent)',
                          boxShadow: '0 0 0 2px var(--accent-light)',
                        },
                      }}
                      placeholder="What actually happened?"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.9,
                    color: 'var(--text-primary)',
                  }}>
                    Screenshot (Optional)
                  </label>
                  <label style={{
                    display: 'block',
                    border: '2px dashed var(--border)',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'var(--accent)',
                      backgroundColor: 'var(--accent-light)',
                    },
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      margin: '0 auto 1rem',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ImageIcon size={24} color="var(--accent)" />
                    </div>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Click to upload</span> or drag and drop
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      PNG, JPG, or WebP (max. 5MB)
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleBugReportChange('screenshot', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="screenshot-upload"
                    />
                  </label>
                  {bugReport.screenshot && (
                    <div style={{
                      marginTop: '1rem',
                      position: 'relative',
                      display: 'inline-block',
                    }}>
                      <img 
                        src={bugReport.screenshot} 
                        alt="Screenshot preview" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleBugReportChange('screenshot', null)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          border: 'none',
                          color: 'white',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          },
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border)',
                }}>
                  <h4 style={{ marginTop: 0, color: 'var(--text-primary)' }}>System Information</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <div>App Version: Qubit 1.0.0</div>
                    {typeof navigator !== 'undefined' && (
                      <>
                        <div>Browser: {navigator.userAgent?.split(') ')[0]?.split('(')[1] || 'Unknown'}</div>
                        <div>Platform: {navigator.platform || 'Unknown'}</div>
                        <div>Screen: {typeof window !== 'undefined' ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : 'N/A'}</div>
                        <div>Language: {navigator.language || 'en'}</div>
                        <div>Cookies: {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to discard this report?')) {
                        setBugReport({
                          subject: '',
                          description: '',
                          type: 'other',
                          severity: 'medium',
                          steps: '',
                          expected: '',
                          actual: '',
                          screenshot: null,
                        });
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'var(--bg-hover)',
                      },
                    }}
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: 'var(--accent)',
                      color: 'white',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'var(--accent-hover)',
                      },
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
