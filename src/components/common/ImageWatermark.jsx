import React from 'react';

/**
 * ImageWatermark Component
 * Optional: Adds a visible watermark overlay to images for extra protection
 * Usage: Wrap your image elements with this component
 * 
 * Example:
 * <ImageWatermark>
 *   <img src="/path/to/image.jpg" alt="Protected" />
 * </ImageWatermark>
 */
export default function ImageWatermark({ children, text = "© VIJAY METAL WORKS" }) {
  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      width: '100%',
      height: '100%'
    }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 200px)',
          zIndex: 1
        }}
      >
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            transform: 'rotate(-45deg)',
            userSelect: 'none',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '20px'
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
