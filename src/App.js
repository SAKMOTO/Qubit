import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { Terminal, Play, Square, Rocket, Cpu, Server, Home as HomeIcon, Archive as ArchiveIcon, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import './App.css';
import CardSwap, { Card } from './components/CardSwap';
import Dock from './components/Dock';
import TerminalComponent from './components/Terminal';
import Spline from '@splinetool/react-spline';
import SplitText from './components/SplitText';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Archive from './pages/Archive';

// Feature card style
const featureCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '1.5rem',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  },
  color: 'rgba(255, 255, 255, 0.9)'
};

// Main App Component
const AppContent = () => {
  const location = useLocation();
  const [qubitStatus, setQubitStatus] = useState('idle');
  const [openHandsStatus, setOpenHandsStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [qubitLogs, setQubitLogs] = useState([]);
  const [openHandsLogs, setOpenHandsLogs] = useState([]);
  const [openHandsInput, setOpenHandsInput] = useState('');
  // Use simpler text-based terminal by default to avoid xterm viewport runtime errors
  const [useRealTerminal, setUseRealTerminal] = useState(false);
  
  // Refs for auto-scrolling terminals
  const qubitTerminalRef = React.useRef(null);
  const openHandsTerminalRef = React.useRef(null);
  const openHandsInputRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  // Connect to Electron IPC
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for Qubit output - stream to Qubit terminal
      window.electronAPI.onQubitOutput?.((data) => {
        if (data && data.trim()) {
          const lines = data.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            setQubitLogs(prev => [...prev, { message: line, type: 'info' }]);
            addLog(`[Qubit] ${line}`, 'info');
          });
        }
      });

      // Listen for OpenHands output - stream to OpenHands terminal (legacy text mode)
      window.electronAPI.onOpenHandsOutput?.((data) => {
        if (!useRealTerminal && data && data.trim()) {
          const isError = data.toLowerCase().includes('error') || 
                         data.toLowerCase().includes('docker') ||
                         data.includes('❌') ||
                         data.includes('failed');
          const lines = data.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            setOpenHandsLogs(prev => [...prev, { 
              message: line, 
              type: isError ? 'error' : 'info' 
            }]);
            addLog(`[OpenHands] ${line}`, isError ? 'error' : 'info');
          });
        }
      });

      // Listen for real terminal data (xterm)
      window.electronAPI.onOpenHandsTerminalData?.((data) => {
        if (useRealTerminal && xtermRef.current) {
          xtermRef.current.write(data);
        }
      });

      // Listen for terminal exit
      window.electronAPI.onOpenHandsTerminalExit?.((code) => {
        setOpenHandsStatus('idle');
        if (xtermRef.current) {
          xtermRef.current.write(`\r\n[Terminal exited with code ${code}]\r\n`);
        }
      });

      // Listen for status updates
      window.electronAPI.onQubitStatus?.((status) => {
        setQubitStatus(status ? 'running' : 'idle');
        if (!status) {
          setQubitLogs(prev => [...prev, { message: '[Process stopped]', type: 'system' }]);
        }
      });

      window.electronAPI.onOpenHandsStatus?.((status) => {
        setOpenHandsStatus(status ? 'running' : status === false ? 'error' : 'idle');
        if (!status) {
          setOpenHandsLogs(prev => [...prev, { message: '[Process stopped]', type: 'system' }]);
        }
      });

      // Check initial status
      window.electronAPI.getStatus?.().then(status => {
        if (status?.qubit) setQubitStatus('running');
        if (status?.openhands) setOpenHandsStatus('running');
      });
    }
  }, []);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { 
      id: Date.now(), 
      message: message.trim(), 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const launchQubitBrowser = async () => {
    setQubitStatus('launching');
    setQubitLogs([]); // Clear terminal
    setQubitLogs(prev => [...prev, { message: '🚀 Launching Qubit Browser...', type: 'info' }]);
    addLog('🚀 Launching Qubit Browser...', 'info');
    
    if (window.electronAPI?.launchQubit) {
      try {
        const result = await window.electronAPI.launchQubit();
        if (result.success) {
          setQubitLogs(prev => [...prev, { message: result.message, type: 'success' }]);
          addLog(result.message, 'success');
        } else {
          setQubitLogs(prev => [...prev, { message: `❌ ${result.message}`, type: 'error' }]);
          addLog(`❌ ${result.message}`, 'error');
          setQubitStatus('idle');
        }
      } catch (error) {
        setQubitLogs(prev => [...prev, { message: `❌ Error: ${error.message}`, type: 'error' }]);
        addLog(`❌ Error: ${error.message}`, 'error');
        setQubitStatus('idle');
      }
    } else {
      // Fallback simulation
      setTimeout(() => {
        setQubitStatus('running');
        setQubitLogs(prev => [...prev, { message: '✅ Qubit Browser launched successfully!', type: 'success' }]);
        addLog('✅ Qubit Browser launched successfully!', 'success');
      }, 2000);
    }
  };

  const stopQubitBrowser = async () => {
    if (window.electronAPI?.stopProcess) {
      try {
        await window.electronAPI.stopProcess('qubit');
        setQubitStatus('idle');
        addLog('⏹️ Qubit Browser stopped', 'info');
      } catch (error) {
        addLog(`❌ Error: ${error.message}`, 'error');
      }
    } else {
      setQubitStatus('idle');
      addLog('⏹️ Qubit Browser stopped', 'info');
    }
  };

  const launchOpenHands = async () => {
    setOpenHandsStatus('launching');
    setOpenHandsLogs([]); // Clear terminal
    setOpenHandsLogs(prev => [...prev, { message: '🚀 Launching OpenHands...', type: 'info' }]);
    addLog('🚀 Launching OpenHands...', 'info');
    
    if (window.electronAPI?.launchOpenHands) {
      try {
        const result = await window.electronAPI.launchOpenHands();
        if (result.success) {
          setOpenHandsLogs(prev => [...prev, { message: result.message, type: 'success' }]);
          addLog(result.message, 'success');
        } else {
          setOpenHandsLogs(prev => [...prev, { message: `❌ ${result.message}`, type: 'error' }]);
          addLog(`❌ ${result.message}`, 'error');
          setOpenHandsStatus('idle');
        }
      } catch (error) {
        setOpenHandsLogs(prev => [...prev, { message: `❌ Error: ${error.message}`, type: 'error' }]);
        addLog(`❌ Error: ${error.message}`, 'error');
        setOpenHandsStatus('idle');
      }
    } else {
      // Fallback simulation
      setTimeout(() => {
        setOpenHandsLogs(prev => [...prev, { message: '✅ OpenHands launched successfully', type: 'success' }]);
        addLog('✅ OpenHands launched successfully', 'success');
        setOpenHandsStatus('running');
      }, 2000);
    }
  };
  
  const sendOpenHandsMessage = () => {
    if (openHandsInput.trim() && openHandsStatus === 'running') {
      const message = openHandsInput.trim();
      setOpenHandsLogs(prev => [...prev, { message: `> ${message}`, type: 'user' }]);
      addLog(`[You] ${message}`, 'user');
      
      if (window.electronAPI && window.electronAPI.sendOpenHandsInput) {
        window.electronAPI.sendOpenHandsInput(message).then(result => {
          if (!result.success) {
            addLog(`[Error] ${result.message}`, 'error');
          }
        });
      }
      
      setOpenHandsInput('');
      // Keep focus on the input so the user can continue typing
      if (openHandsInputRef.current) {
        openHandsInputRef.current.focus();
      }
    }
  };

  const stopOpenHands = async () => {
    if (window.electronAPI?.stopProcess) {
      try {
        await window.electronAPI.stopProcess('openhands');
        setOpenHandsStatus('idle');
        addLog('⏹️ OpenHands stopped', 'info');
      } catch (error) {
        addLog(`❌ Error: ${error.message}`, 'error');
      }
    } else {
      setOpenHandsStatus('idle');
      addLog('⏹️ OpenHands stopped', 'info');
    }
  };

  const dockItems = [
    { 
      icon: <HomeIcon size={20} />, 
      label: 'Home', 
      path: '/',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    { 
      icon: <ArchiveIcon size={20} />, 
      label: 'Archive', 
      path: '/archive'
    },
    { 
      icon: <UserIcon size={20} />, 
      label: 'Profile', 
      path: '/profile'
    },
    { 
      icon: <SettingsIcon size={20} />, 
      label: 'Settings', 
      path: '/settings'
    },
  ];

  // Don't show dock on settings page
  const showDock = location.pathname !== '/settings';

  // Auto-scroll terminals to bottom
  useEffect(() => {
    if (qubitTerminalRef.current) {
      qubitTerminalRef.current.scrollTop = qubitTerminalRef.current.scrollHeight;
    }
  }, [qubitLogs]);
  
  useEffect(() => {
    if (openHandsTerminalRef.current) {
      openHandsTerminalRef.current.scrollTop = openHandsTerminalRef.current.scrollHeight;
    }
  }, [openHandsLogs]);
  
  // Auto-scroll main logs to bottom
  useEffect(() => {
    const logOutput = document.querySelector('.log-output');
    if (logOutput) {
      logOutput.scrollTop = logOutput.scrollHeight;
    }
  }, [logs]);

  // Layout wrapper that adds the Dock around page content
  const Layout = ({ children }) => (
    <>
      {children}
      {showDock && (
        <Dock 
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      )}
    </>
  );

  // Home Component
  const Home = () => (
    <div className="quantum-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Cpu size={32} className="logo-icon" />
            <span className="logo-text">QubitDesktop</span>
          </div>
          <nav className="nav">
            <a href="#dashboard" className="nav-link">Dashboard</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#docs" className="nav-link">Documentation</a>
            <a href="#support" className="nav-link">Support</a>
          </nav>
          <div className="header-actions">
            <button className="btn-secondary">Sign In</button>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '2rem 0' }}>
        <div className="hero-visual" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '100%', 
            height: '70vh', 
            minHeight: '500px',
            maxHeight: '800px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}>
              <Spline 
                scene="https://prod.spline.design/9Q4IpGbdyIuSLnBJ/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <div style={{ 
              position: 'relative', 
              zIndex: 2, 
              textAlign: 'center',
              marginTop: '5vh',
              marginBottom: 'auto',
              padding: '0 1rem',
              maxWidth: '800px',
              transform: 'translateY(-20px)'
            }}>
              <SplitText
                text="Welcome to Qubit"
                className="hero-title"
                tag="h1"
                delay={50}
                duration={0.8}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}
              >
                {({ style, children }) => (
                  <h1 style={style}>{children}</h1>
                )}
              </SplitText>
            </div>
            
            <div className="hero-actions" style={{ 
              position: 'relative', 
              zIndex: 2, 
              marginTop: 'auto',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                className="cta-button" 
                onClick={launchQubitBrowser}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem'
                }}
              >
                <Rocket size={20} style={{ marginRight: '0.5rem' }} />
                Start Quantum Journey
              </button>
              <button 
                className="cta-button-secondary"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem'
                }}
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quantum Features Section */}
      <section className="quantum-features" style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Powerful Quantum Tools</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Everything you need to explore quantum computing
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={featureCardStyle}>
              <h3 style={{ marginTop: 0 }}>Qubit Browser</h3>
              <p>Experience the next generation of web browsing with quantum-enhanced security and performance. Our Qubit Browser uses quantum-resistant algorithms to keep your data safe.</p>
            </div>
            
            <div style={featureCardStyle}>
              <h3 style={{ marginTop: 0 }}>Quantum Simulations</h3>
              <p>Run complex quantum simulations with our intuitive interface. Visualize quantum states and algorithms in real-time with our powerful simulation engine.</p>
            </div>
            
            <div style={featureCardStyle}>
              <h3 style={{ marginTop: 0 }}>Algorithm Playground</h3>
              <p>Experiment with quantum algorithms using our drag-and-drop interface. No coding required to explore the power of quantum computing.</p>
            </div>
            
            <div style={featureCardStyle}>
              <h3 style={{ marginTop: 0 }}>Quantum Learning</h3>
              <p>Learn quantum computing concepts through interactive tutorials and guided exercises. Perfect for both beginners and advanced users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quantum Connections Section with Spline */}
      <section className="quantum-connections" style={{ padding: '4rem 0', backgroundColor: '#0f172a', minHeight: '600px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>Quantum Connections</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Visualizing quantum entanglement and connections
          </p>
          <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)' }}>
            <Spline 
              scene="https://prod.spline.design/mik7PWoUtkfGyvTm/scene.splinecode"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section with CardSwap */}
      <section className="features-section" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <h2 className="section-title">Powerful Quantum Tools</h2>
          <p className="section-subtitle">Everything you need to explore quantum computing</p>
          
          <div className="card-swap-container">
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={true}
            >
              <Card className="feature-card">
                <div className="card-icon">
                  <Cpu size={32} />
                </div>
                <h3>Qubit Browser</h3>
                <p>Advanced quantum web browser with enhanced security and quantum-resistant protocols.</p>
                <ul className="feature-list">
                  <li>Quantum-safe encryption</li>
                  <li>Parallel processing</li>
                  <li>Real-time optimization</li>
                </ul>
              </Card>
              <Card className="feature-card">
                <div className="card-icon">
                  <Terminal size={32} />
                </div>
                <h3>OpenHands CLI</h3>
                <p>Command-line interface for quantum algorithm development and simulation.</p>
                <ul className="feature-list">
                  <li>Quantum circuit design</li>
                  <li>Simulation environment</li>
                  <li>Real-time debugging</li>
                </ul>
              </Card>
              <Card className="feature-card">
                <div className="card-icon">
                  <Server size={32} />
                </div>
                <h3>Quantum Services</h3>
                <p>Comprehensive suite of quantum computing services and APIs.</p>
                <ul className="feature-list">
                  <li>Cloud quantum processing</li>
                  <li>Algorithm marketplace</li>
                  <li>Collaboration tools</li>
                </ul>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>

      {/* Control Panel */}
      <section className="control-section">
        <div className="container">
          <h2 className="section-title">Quantum Control Center</h2>
          
          <div className="control-grid">
            {/* Qubit Browser Controls */}
            <div className="control-card">
              <div className="control-header">
                <Cpu size={24} />
                <h3>Qubit Desktop App</h3>
              </div>
              <div className="control-buttons">
                <button 
                  className={`control-btn ${qubitStatus === 'running' ? 'btn-success' : 'btn-primary'}`}
                  onClick={launchQubitBrowser}
                  disabled={qubitStatus === 'launching' || qubitStatus === 'running'}
                >
                  <Play size={16} />
                  {qubitStatus === 'launching' ? 'Launching...' : '🚀 Launch Qubit Browser'}
                </button>
                <button 
                  className="control-btn btn-danger"
                  onClick={stopQubitBrowser}
                  disabled={qubitStatus !== 'running'}
                >
                  <Square size={16} />
                  ⏹️ Stop
                </button>
              </div>
              <div className="status-indicator">
                Status: <span className={`status ${qubitStatus}`}>
                  {qubitStatus === 'idle' && 'Ready'}
                  {qubitStatus === 'launching' && 'Launching...'}
                  {qubitStatus === 'running' && 'Running'}
                </span>
              </div>
            </div>

            {/* OpenHands Controls */}
            <div className="control-card">
              <div className="control-header">
                <Terminal size={24} />
                <h3>OpenHands CLI</h3>
              </div>
              <div className="control-buttons">
                <button 
                  className={`control-btn ${openHandsStatus === 'running' ? 'btn-success' : 'btn-primary'}`}
                  onClick={launchOpenHands}
                  disabled={openHandsStatus === 'launching'}
                >
                  <Play size={16} />
                  {openHandsStatus === 'launching' ? 'Launching...' : '🤖 Launch OpenHands'}
                </button>
                <button 
                  className="control-btn btn-danger"
                  onClick={stopOpenHands}
                  disabled={openHandsStatus !== 'running' && openHandsStatus !== 'error'}
                >
                  <Square size={16} />
                  ⏹️ Stop
                </button>
              </div>
              <div className="status-indicator">
                Status: <span className={`status ${openHandsStatus}`}>
                  {openHandsStatus === 'idle' && 'Ready'}
                  {openHandsStatus === 'launching' && 'Launching...'}
                  {openHandsStatus === 'running' && 'Running'}
                  {openHandsStatus === 'error' && 'Docker Required'}
                </span>
              </div>
            </div>
          </div>
          {/* Log Output */}
          <div className="log-container">
            <div className="log-header">
              <Terminal size={20} />
              <h3>System Logs</h3>
              <button 
                className="clear-logs-btn"
                onClick={() => setLogs([])}
              >
                Clear
              </button>
            </div>
            <div className="log-output">
              {logs.length === 0 ? (
                <div className="no-logs">No logs yet. Launch a service to see logs here.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Terminal Panels - Side by Side */}
          <div className="terminal-panels">
            {/* Qubit Terminal */}
            <div className="terminal-panel">
              <div className="terminal-header">
                <div className="terminal-title">
                  <span className={`status-dot ${qubitStatus === 'running' ? 'running' : ''}`}></span>
                  <Cpu size={18} />
                  <span>Qubit Browser Terminal</span>
                </div>
                <button 
                  className="clear-terminal-btn"
                  onClick={() => setQubitLogs([])}
                >
                  Clear
                </button>
              </div>
              <div className="terminal-output" id="qubit-terminal" ref={qubitTerminalRef}>
                {qubitLogs.length === 0 ? (
                  <div className="empty-terminal">Click "Launch Qubit Browser" to start</div>
                ) : (
                  qubitLogs.map((log, idx) => (
                    <div key={idx} className={`terminal-line ${log.type}`}>
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* OpenHands Terminal */}
            <div className="terminal-panel">
              <div className="terminal-header">
                <div className="terminal-title">
                  <span className={`status-dot ${openHandsStatus === 'running' ? 'running' : ''}`}></span>
                  <Terminal size={18} />
                  <span>OpenHands CLI Terminal</span>
                </div>
                <button 
                  className="clear-terminal-btn"
                  onClick={() => setOpenHandsLogs([])}
                >
                  Clear
                </button>
              </div>
              {/* Real Interactive Terminal */}
              {useRealTerminal ? (
                <div style={{ flex: 1, minHeight: '400px', height: '100%', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <TerminalComponent
                    onInput={(data) => {
                      if (openHandsStatus === 'running' && window.electronAPI && window.electronAPI.sendOpenHandsInput) {
                        window.electronAPI.sendOpenHandsInput(data).catch(err => {
                          console.error('Error sending terminal input:', err);
                        });
                      }
                    }}
                    onReady={(term, fitAddon) => {
                      xtermRef.current = term;
                      fitAddonRef.current = fitAddon;
                      // Write welcome message if terminal is not running
                      if (openHandsStatus !== 'running' && openHandsLogs.length === 0) {
                        term.writeln('\r\n\x1b[33mClick "Launch OpenHands" to start interactive terminal\x1b[0m\r\n');
                      }
                    }}
                    isActive={openHandsStatus === 'running'}
                  />
                  <div className="chat-input-container" style={{ borderTop: '1px solid #222' }}>
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={openHandsStatus === 'running' ? 'Type here and press Enter' : 'Launch OpenHands to type'}
                      value={openHandsInput}
                      onChange={(e) => setOpenHandsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && openHandsInput.trim() && openHandsStatus === 'running') {
                          const msg = openHandsInput.trim();
                          if (window.electronAPI && window.electronAPI.sendOpenHandsInput) {
                            window.electronAPI.sendOpenHandsInput(msg + '\r');
                          }
                          setOpenHandsInput('');
                        }
                      }}
                      disabled={openHandsStatus !== 'running'}
                    />
                    <button
                      className="send-btn"
                      onClick={() => {
                        if (openHandsInput.trim() && openHandsStatus === 'running') {
                          const msg = openHandsInput.trim();
                          if (window.electronAPI && window.electronAPI.sendOpenHandsInput) {
                            window.electronAPI.sendOpenHandsInput(msg + '\r');
                          }
                          setOpenHandsInput('');
                        }
                      }}
                      disabled={openHandsStatus !== 'running' || !openHandsInput.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="terminal-output" id="openhands-terminal" ref={openHandsTerminalRef}>
                    {openHandsLogs.length === 0 ? (
                      <div className="empty-terminal">Click "Launch OpenHands" to start</div>
                    ) : (
                      openHandsLogs.map((log, idx) => (
                        <div key={idx} className={`terminal-line ${log.type}`}>
                          {log.message}
                        </div>
                      ))
                    )}
                  </div>
                  {/* Chat Input for OpenHands */}
                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Type message to OpenHands (Enter to send)"
                      value={openHandsInput}
                      onChange={(e) => setOpenHandsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendOpenHandsMessage();
                        }
                      }}
                      ref={openHandsInputRef}
                      autoFocus
                    />
                    <button
                      className="send-btn"
                      onClick={sendOpenHandsMessage}
                      disabled={!openHandsInput.trim()}
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Layout>
            <Home />
          </Layout>
        } 
      />
      <Route 
        path="/settings" 
        element={<Settings />} 
      />
      <Route 
        path="/profile" 
        element={
          <Layout>
            <Profile />
          </Layout>
        } 
      />
      <Route 
        path="/archive" 
        element={
          <Layout>
            <Archive />
          </Layout>
        } 
      />
    </Routes>
  );
};

// Wrap AppContent with Router and ErrorBoundary
const App = () => (
  <ErrorBoundary>
    <Router>
      <AppContent />
    </Router>
  </ErrorBoundary>
);

export default App;
