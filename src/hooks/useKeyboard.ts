import { useEffect } from 'react';

/**
 * Hook to handle keyboard visibility on mobile devices
 * Ensures input fields are visible when virtual keyboard appears
 */
export function useKeyboardAdjustment() {
  useEffect(() => {
    // Only apply on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      // Check if the focused element is an input or textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Small delay to ensure keyboard is shown
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300);
      }
    };

    // Add focus event listener to document
    document.addEventListener('focusin', handleFocus, true);

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
    };
  }, []);
}

/**
 * Hook to handle visual viewport changes (for more advanced control)
 */
export function useVisualViewport(callback?: (height: number) => void) {
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const height = window.visualViewport!.height;
      callback?.(height);

      // Update CSS custom property for use in styles
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${height}px`
      );
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [callback]);
}
