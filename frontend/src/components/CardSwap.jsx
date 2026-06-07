import React, { useState, useEffect, useRef, cloneElement, Children } from 'react';

export const Card = ({ children, className = '', style = {} }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
};

const CardSwap = ({ 
  children, 
  cardDistance = 60, 
  verticalDistance = 70, 
  delay = 5000,
  pauseOnHover = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const childrenArray = Children.toArray(children);

  useEffect(() => {
    if (!pauseOnHover || !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % childrenArray.length);
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay, childrenArray.length, pauseOnHover, isHovered]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false);
    }
  };

  return (
    <div 
      className="card-swap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        perspective: '1000px'
      }}
    >
      {childrenArray.map((child, index) => {
        const isActive = index === currentIndex;
        const isNext = index === (currentIndex + 1) % childrenArray.length;
        const isPrev = index === (currentIndex - 1 + childrenArray.length) % childrenArray.length;
        
        let transform = '';
        let zIndex = 0;
        let opacity = 0.3;

        if (isActive) {
          transform = 'translateZ(0) scale(1)';
          zIndex = 3;
          opacity = 1;
        } else if (isNext) {
          transform = `translateX(${cardDistance}px) translateY(${verticalDistance}px) translateZ(-${cardDistance}px) scale(0.9)`;
          zIndex = 2;
          opacity = 0.7;
        } else if (isPrev) {
          transform = `translateX(-${cardDistance}px) translateY(${verticalDistance}px) translateZ(-${cardDistance}px) scale(0.9)`;
          zIndex = 2;
          opacity = 0.7;
        } else {
          transform = 'translateZ(-200px) scale(0.8)';
          zIndex = 1;
          opacity = 0.3;
        }

        return cloneElement(child, {
          key: index,
          style: {
            ...child.props.style,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) ${transform}`,
            zIndex,
            opacity,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: isActive ? 'default' : 'pointer',
            pointerEvents: isActive ? 'auto' : 'none'
          }
        });
      })}
    </div>
  );
};

export default CardSwap;





