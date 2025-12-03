import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

const Terminal = ({ onInput, onReady, isActive }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      theme: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        cursor: '#ff6b35',
        selection: 'rgba(255, 107, 53, 0.3)',
        black: '#000000',
        red: '#f44336',
        green: '#4caf50',
        yellow: '#ff9800',
        blue: '#2196f3',
        magenta: '#e91e63',
        cyan: '#00bcd4',
        white: '#ffffff',
        brightBlack: '#666666',
        brightRed: '#f44336',
        brightGreen: '#4caf50',
        brightYellow: '#ff9800',
        brightBlue: '#2196f3',
        brightMagenta: '#e91e63',
        brightCyan: '#00bcd4',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    // Make URLs clickable
    try {
      term.loadAddon(new WebLinksAddon());
    } catch (_) {
      // optional
    }
    
    // Open terminal
    term.open(terminalRef.current);
    
    // Wait for next tick to ensure container has dimensions
    setTimeout(() => {
      try {
        if (terminalRef.current && fitAddon) {
          fitAddon.fit();
        }
      } catch (error) {
        console.warn('Terminal fit error (will retry):', error);
        // Retry after a short delay
        setTimeout(() => {
          try {
            if (terminalRef.current && fitAddon) {
              fitAddon.fit();
            }
          } catch (retryError) {
            console.error('Terminal fit retry failed:', retryError);
          }
        }, 100);
      }
    }, 0);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Register clickable option links: matches like "1)", "[1]", or standalone numbers in menus
    const optionRegexes = [
      /(\b\d+)\)/g,     // 1)
      /\[(\d+)\]/g,     // [1]
      /(?:^|\s)(\d+)(?=\s+-|\s+\w|\s*$)/g // 1 - Start, or single number at EOL
    ];

    // Regex for prompt-toolkit style menu lines
    const selectedLineRe = /^>\s+.+/;      // "> Option"
    const unselectedLineRe = /^\s{2}.+/;   // "  Option"

    // Helper to build links for a given buffer line
    const buildLinksForLine = (y) => {
      const line = term.buffer.active.getLine(y - 1);
      if (!line) return [];
      const text = line.translateToString(true);
      const links = [];
      optionRegexes.forEach((regex) => {
        let match;
        while ((match = regex.exec(text)) !== null) {
          const num = match[1];
          const startIndex = match.index + (match[0].startsWith(' ') ? 1 : 0) + (match[0].startsWith('[') ? 1 : 0);
          const endIndex = startIndex + num.length; // exclusive
          const startX = Math.max(1, startIndex + 1); // xterm columns are 1-based
          const endX = Math.max(startX, endIndex); // inclusive per API below
          links.push({
            range: { start: { x: startX, y }, end: { x: endX, y } },
            text: num,
          });
        }
      });
      // Add full-line clickable regions for TUI menus
      if (selectedLineRe.test(text) || unselectedLineRe.test(text)) {
        const visualText = text.replace(/\s+$/,'');
        const length = Math.max(visualText.length, 1);
        links.push({
          range: { start: { x: 1, y }, end: { x: length, y } },
          text: visualText,
          isMenu: true,
        });
      }
      return links;
    };

    // Custom link provider for option numbers
    const linkProviderDisposable = term.registerLinkProvider({
      provideLinks(y, callback) {
        try {
          const rawLinks = buildLinksForLine(y);
          const links = rawLinks.map((l) => ({
            range: l.range,
            text: l.text,
            activate: () => {
              if (!isActive || !onInput) return;
              // If it's a numeric option link, send number + Enter
              if (!l.isMenu) {
                onInput(l.text + '\r');
                return;
              }
              // For TUI menu lines, navigate via arrow keys relative to the currently selected line ('> ')
              // Search around the clicked line for a selected line marker
              const buf = term.buffer.active;
              const height = buf.length;
              const maxScan = 30;
              let selectedY = null;
              for (let dy = 0; dy <= maxScan; dy++) {
                for (const sign of [-1, 1]) {
                  const yy = y + dy * sign;
                  if (yy < 1 || yy > height) continue;
                  const ln = buf.getLine(yy - 1);
                  if (!ln) continue;
                  const t = ln.translateToString(true);
                  if (selectedLineRe.test(t)) { selectedY = yy; break; }
                }
                if (selectedY !== null) break;
              }
              // If we didn't find, fallback to just Enter
              if (selectedY === null) {
                onInput('\r');
                return;
              }
              const delta = y - selectedY;
              const up = '\u001b[A';
              const down = '\u001b[B';
              const seq = delta > 0 ? down : up;
              for (let i = 0; i < Math.abs(delta); i++) onInput(seq);
              onInput('\r');
            },
          }));
          callback(links);
        } catch (_) {
          callback([]);
        }
      },
    });

    // Handle user typing
    term.onData((data) => {
      if (isActive && onInput) {
        onInput(data);
      }
    });

    // Notify parent that terminal is ready
    if (onReady) {
      onReady(term, fitAddon);
    }

    // Use ResizeObserver for better container size tracking
    if (terminalRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (fitAddon && terminalRef.current) {
          try {
            fitAddon.fit();
          } catch (error) {
            // Silently ignore resize errors
          }
        }
      });
      resizeObserverRef.current.observe(terminalRef.current);
    }

    // Fallback: Handle window resize
    const handleResize = () => {
      if (fitAddon && terminalRef.current) {
        try {
          fitAddon.fit();
        } catch (error) {
          // Silently ignore resize errors
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      if (term) {
        try {
          term.dispose();
        } catch (error) {
          console.error('Error disposing terminal:', error);
        }
      }
      if (linkProviderDisposable) {
        try { linkProviderDisposable.dispose(); } catch (_) {}
      }
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  // Update isActive handler
  useEffect(() => {
    if (xtermRef.current && isActive) {
      xtermRef.current.focus();
    }
  }, [isActive]);

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
      }} 
    />
  );
};

export default Terminal;


