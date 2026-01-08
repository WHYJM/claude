import { useEffect } from 'react';

/**
 * Hook to handle keyboard visibility on mobile devices
 * Ensures input fields are visible when virtual keyboard appears
 * Includes special handling for dialogs and modals
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
        // Check if input is inside a dialog/modal (shadcn/ui compatible)
        const dialog = target.closest('[role="dialog"], [role="alertdialog"], [data-slot="dialog-content"], .dialog-content');

        // Small delay to ensure keyboard is shown
        setTimeout(() => {
          if (dialog) {
            // For dialog inputs, scroll within the dialog content
            const dialogContent = dialog.querySelector('[data-dialog-content], [data-slot="scroll-area-viewport"], .dialog-scroll-area');
            if (dialogContent) {
              // Scroll the dialog content, not the whole page
              const inputRect = target.getBoundingClientRect();

              // Calculate if input is below the visible area
              const inputBottom = inputRect.bottom;
              const visibleBottom = window.visualViewport?.height || window.innerHeight;

              if (inputBottom > visibleBottom - 50) {
                // Scroll dialog content to bring input into view
                const scrollOffset = inputBottom - visibleBottom + 100;
                dialogContent.scrollBy({
                  top: scrollOffset,
                  behavior: 'smooth'
                });
              }
            } else {
              // Fallback: scroll the dialog itself
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          } else {
            // Regular page scroll
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 300);
      }
    };

    const handleBlur = () => {
      // Remove any keyboard-open class when input loses focus
      document.body.classList.remove('keyboard-open');
    };

    // Add focus event listener to document
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('focusout', handleBlur, true);
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
