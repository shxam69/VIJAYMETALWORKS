import React from 'react';

/**
 * WatermarkedImage Component
 * Renders an image with a transparent "VIJAY METAL WORKS" watermark overlay
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Image alt text
 * @param {object} style - Additional inline styles for the image
 * @param {object} containerStyle - Additional inline styles for the container
 * @param {string} className - CSS class for the image
 * @param {function} onLoad - Callback when image loads
 * @param {boolean} showWatermark - Whether to show watermark (default: true)
 */
const WatermarkedImage = ({ 
  src, 
  alt, 
  style = {}, 
  containerStyle = {},
  className = '',
  onLoad,
  showWatermark = true,
  ...props 
}) => {
  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        ...containerStyle
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        style={style}
        className={className}
        onLoad={onLoad}
        {...props}
      />
      
      {showWatermark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'Jost', 'Cinzel', serif",
              fontSize: 'clamp(14px, 3vw, 28px)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.15)',
              textShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
              transform: 'rotate(-25deg)',
              whiteSpace: 'nowrap',
              padding: '20px',
            }}
          >
            VIJAY METAL WORKS
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkedImage;
