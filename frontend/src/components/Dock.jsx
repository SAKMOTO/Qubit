import React, { useState } from 'react';

const Dock = ({ 
  items, 
  panelHeight = 68, 
  baseItemSize = 50, 
  magnification = 70 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const calculateSize = (index) => {
    if (hoveredIndex === null) return baseItemSize;
    
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) {
      return baseItemSize + magnification;
    }
    // Gradually decrease size based on distance
    const sizeReduction = Math.max(0, magnification * (1 - distance * 0.3));
    return baseItemSize + sizeReduction;
  };

  return (
    <div 
      className="dock"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: `${panelHeight}px`,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '8px 16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {items.map((item, index) => {
        const size = calculateSize(index);
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={item.onClick}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              margin: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isHovered 
                ? 'rgba(102, 126, 234, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isHovered 
                ? '1px solid rgba(102, 126, 234, 0.5)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative'
            }}
            title={item.label}
          >
            <div
              style={{
                width: `${baseItemSize * 0.6}px`,
                height: `${baseItemSize * 0.6}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              {item.icon}
            </div>
            {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Dock;





