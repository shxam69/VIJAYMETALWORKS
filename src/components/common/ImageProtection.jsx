import { useEffect, useState } from 'react';

/**
 * ImageProtection Component
 * Comprehensive protection for company images from unauthorized copying:
 * - Right-click context menu blocking
 * - Keyboard shortcut prevention (PrintScreen, Ctrl+S, DevTools, etc.)
 * - CSS-based protections (user-select, drag prevention)
 * - Screenshot detection with visual feedback
 * - Mobile long-press prevention
 * - Clipboard monitoring
 */
export default function ImageProtection() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let warningTimeout = null;
    let rightClickCount = 0;
    let rightClickTimer = null;

    // Show warning message to user
    const displayWarning = (message) => {
      setShowWarning(true);
      if (warningTimeout) clearTimeout(warningTimeout);
      warningTimeout = setTimeout(() => setShowWarning(false), 3000);
      
      // Optional: log attempt for analytics
      console.warn(`Image protection: ${message}`);
    };

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // Increment right-click count
      rightClickCount++;
      
      // Clear existing timer
      if (rightClickTimer) clearTimeout(rightClickTimer);
      
      // Only show warning on second right-click
      if (rightClickCount >= 2) {
        displayWarning('Right-click disabled');
        rightClickCount = 0; // Reset count after showing warning
      }
      
      // Reset count after 2 seconds of no right-clicks
      rightClickTimer = setTimeout(() => {
        rightClickCount = 0;
      }, 2000);
      
      return false;
    };

    // Prevent keyboard shortcuts for screenshots and saving
    const handleKeyDown = (e) => {
      // Prevent PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        displayWarning('Screenshots are not allowed');
        // Blur content briefly to interfere with screenshot
        document.body.style.filter = 'blur(10px)';
        setTimeout(() => { document.body.style.filter = 'none'; }, 100);
        return false;
      }

      // Prevent Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        displayWarning('Saving is disabled');
        return false;
      }

      // Prevent Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        displayWarning('Printing is disabled');
        return false;
      }

      // Prevent Ctrl+Shift+S (Save As)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        displayWarning('Saving is disabled');
        return false;
      }

      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        displayWarning('Developer tools are disabled');
        return false;
      }

      // Prevent Ctrl+Shift+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i') {
        e.preventDefault();
        displayWarning('Developer tools are disabled');
        return false;
      }

      // Prevent Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'j') {
        e.preventDefault();
        displayWarning('Developer tools are disabled');
        return false;
      }

      // Prevent Ctrl+Shift+C (Inspect element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        displayWarning('Developer tools are disabled');
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        displayWarning('View source is disabled');
        return false;
      }

      // Prevent Ctrl+Shift+E (Network tab)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+A (Select all)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          e.preventDefault();
          displayWarning('Copying is disabled');
          return false;
        }
      }
    };

    // Prevent dragging images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        displayWarning('Dragging images is not allowed');
        return false;
      }
    };

    // Prevent copy event
    const handleCopy = (e) => {
      e.preventDefault();
      displayWarning('Copying is disabled');
      return false;
    };

    // Prevent cut event
    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    // Detect screenshot attempts via visibility change (silent - no warning popup)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away - might be taking screenshot (no popup shown)
        console.warn('Image protection: User switched tabs/windows');
      }
    };

    // Detect window blur (screenshot tools, snipping tool) - silent blur effect
    const handleBlur = () => {
      // Apply temporary blur to interfere with screenshot tools (no popup)
      document.body.style.filter = 'blur(10px)';
      setTimeout(() => {
        if (!document.hidden) {
          document.body.style.filter = 'none';
        }
      }, 200);
    };

    const handleFocus = () => {
      document.body.style.filter = 'none';
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Add CSS protection styles
    const styleEl = document.createElement('style');
    styleEl.id = 'image-protection-styles';
    styleEl.textContent = `
      /* Prevent text/image selection */
      img {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }

      /* Prevent long-press on mobile */
      img {
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /* Prevent selection globally */
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }

      /* Allow text selection for inputs and textareas */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }

      /* Add watermark overlay for extra protection */
      .gallery-image-wrapper {
        position: relative;
      }

      .gallery-image-wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        background: transparent;
      }

      /* Disable print styles for images */
      @media print {
        img {
          display: none !important;
        }
        body::after {
          content: 'Images cannot be printed. Please contact Vijay Metal Works for authorized copies.';
          display: block;
          text-align: center;
          padding: 50px;
          font-size: 18px;
        }
      }

      /* Prevent tap highlight on mobile */
      * {
        -webkit-tap-highlight-color: transparent !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Disable right-click on images specifically
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('oncontextmenu', 'return false;');
      img.setAttribute('ondragstart', 'return false;');
    });

    // Monitor for new images added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IMG') {
            node.setAttribute('oncontextmenu', 'return false;');
            node.setAttribute('ondragstart', 'return false;');
          }
          if (node.querySelectorAll) {
            const newImages = node.querySelectorAll('img');
            newImages.forEach(img => {
              img.setAttribute('oncontextmenu', 'return false;');
              img.setAttribute('ondragstart', 'return false;');
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      
      if (warningTimeout) clearTimeout(warningTimeout);
      if (rightClickTimer) clearTimeout(rightClickTimer);
      
      const style = document.getElementById('image-protection-styles');
      if (style) style.remove();
      
      observer.disconnect();
      document.body.style.filter = 'none';
    };
  }, []);

  // Render warning message when protection is triggered
  return showWarning ? (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(220, 38, 38, 0.95)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontWeight: '600',
      fontSize: '14px',
      pointerEvents: 'none',
      animation: 'slideDown 0.3s ease-out'
    }}>
      🔒 These images are protected. Unauthorized copying is not allowed.
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  ) : null;
}
