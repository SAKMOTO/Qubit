import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dock = ({ items, panelHeight, baseItemSize, magnification }) => {
  const navigate = useNavigate();
  const location = window.location;

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  // Don't show dock on settings page
  if (location.pathname === '/settings') {
    return null;
  }

  return (
    <div 
      className="dock-container" 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
    >
      <div 
        className="dock" 
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: panelHeight,
          padding: '0 10px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {items.map((item, index) => (
          <div 
            key={index}
            onClick={() => handleItemClick(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: baseItemSize,
              height: baseItemSize,
              margin: '0 5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              transform: 'scale(1)',
              color: location.pathname === item.path ? '#60a5fa' : 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `scale(${1 + (magnification / 100)})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {React.cloneElement(item.icon, { 
              size: 24,
              color: location.pathname === item.path ? '#60a5fa' : 'white' 
            })}
            {item.label && (
              <span style={{
                fontSize: '12px',
                marginTop: '5px',
                color: location.pathname === item.path ? '#60a5fa' : 'white',
                textAlign: 'center',
              }}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dock;
