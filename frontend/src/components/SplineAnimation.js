import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Spline component with SSR disabled
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

const SplineAnimation = () => {
  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <Spline
        scene="https://prod.spline.design/9Q4IpGbdyIuSLnBJ/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default SplineAnimation;
