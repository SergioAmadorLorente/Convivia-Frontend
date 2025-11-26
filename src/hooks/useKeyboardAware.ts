import { useEffect, useRef } from 'react';
import { Platform, Keyboard, findNodeHandle, UIManager, TextInput } from 'react-native';

type Options = {
  /** Ref to the scrollable container that should be adjusted. If omitted, the document scrolling element is used. */
  containerRef?: React.RefObject<HTMLElement>;
  /** Extra space (px) to keep between the input and the top of the keyboard / bottom of the viewport. */
  padding?: number;
  /** Small extra scroll (px) to avoid exact-edge clipping. */
  extraScroll?: number;
  /** When true, the hook is active; default true. */
  enabled?: boolean;
};

/**
 * useKeyboardAware
 *
 * A robust browser/mobile-web hook to keep focused inputs visible when the mobile
 * keyboard appears. It uses `visualViewport` when available, falls back to
 * `window.innerHeight` resize events otherwise, and uses `scrollIntoView` /
 * `scrollBy` to nudge the focused element into view. Designed to work in long
 * forms and modal containers. It avoids visual jumps by measuring positions and
 * only performing the minimal scroll necessary; `behavior: 'smooth'` is used
 * where available to reduce jank.
 *
 * Usage:
 *  - Wrap the scrollable area (form or modal content) with an element that has
 *    `overflow: auto` and (recommended) `height: 100dvh` to match the viewport
 *    including mobile keyboard changes. Pass a ref to that element as
 *    `containerRef`.
 *
 * Example:
 *  const containerRef = useRef<HTMLDivElement>(null);
 *  useKeyboardAware({ containerRef, padding: 12 });
 *
 */
export default function useKeyboardAware(options: Options = {}) {
  const { containerRef, padding = 12, extraScroll = 8, enabled = true } = options;
  const rafRef = useRef<number | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Web implementation (uses DOM APIs)
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      const vv = (window as any).visualViewport;

      const getContainer = (): HTMLElement => {
        if (containerRef && (containerRef as any).current) return (containerRef as any).current;
        // fallback to the document scrolling element
        return (document.scrollingElement as HTMLElement) || document.documentElement;
      };

      // Detect whether an element is a text input we care about
      const isTextInput = (el: Element | null) => {
        if (!el) return false;
        const tag = (el as HTMLElement).tagName;
        const inputLike = tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
        return inputLike;
      };

      const adjust = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        rafRef.current = requestAnimationFrame(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active || !isTextInput(active)) return;
          lastActiveRef.current = active;

          const container = getContainer();
          const rect = active.getBoundingClientRect();

          const visualViewport: { height: number; offsetTop?: number } | null = (window as any).visualViewport
            ? { height: (window as any).visualViewport.height, offsetTop: (window as any).visualViewport.offsetTop }
            : null;

          const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
          const viewportOffsetTop = visualViewport ? (visualViewport.offsetTop || 0) : 0;

          const elementBottomRelativeToVisual = rect.bottom - viewportOffsetTop;
          const safeAreaBottom = viewportHeight - padding;

          if (elementBottomRelativeToVisual <= safeAreaBottom) return;

          const overlap = elementBottomRelativeToVisual - safeAreaBottom + extraScroll;

          try {
            if (container === document.documentElement || container === document.body || container === document.scrollingElement) {
              if ('scrollBy' in window) {
                window.scrollBy({ top: overlap, left: 0, behavior: 'smooth' as ScrollBehavior });
              } else {
                window.scrollTo({ top: window.scrollY + overlap, left: 0, behavior: 'smooth' as ScrollBehavior });
              }
            } else if ('scrollBy' in container) {
              (container as any).scrollBy({ top: overlap, left: 0, behavior: 'smooth' as ScrollBehavior });
            } else {
              (container as any).scrollTop = (container as any).scrollTop + overlap;
            }

            setTimeout(() => {
              try {
                active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' as ScrollBehavior });
              } catch (e) {}
            }, 50);
          } catch (err) {
            try {
              active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } catch (e) {}
          }
        });
      };

      const onFocusIn = () => setTimeout(adjust, 50);
      const onFocusOut = () => { lastActiveRef.current = null; };
      const onViewportChange = () => setTimeout(adjust, 50);

      document.addEventListener('focusin', onFocusIn);
      document.addEventListener('focusout', onFocusOut);

      if (vv) {
        (vv as VisualViewport).addEventListener('resize', onViewportChange);
        (vv as VisualViewport).addEventListener('scroll', onViewportChange);
      }

      window.addEventListener('resize', onViewportChange);
      window.addEventListener('orientationchange', onViewportChange);

      const container = getContainer();
      try { container.addEventListener && container.addEventListener('scroll', onViewportChange, { passive: true } as any); } catch (e) {}

      return () => {
        document.removeEventListener('focusin', onFocusIn);
        document.removeEventListener('focusout', onFocusOut);
        if (vv) {
          try { (vv as VisualViewport).removeEventListener('resize', onViewportChange); (vv as VisualViewport).removeEventListener('scroll', onViewportChange); } catch (_) {}
        }
        window.removeEventListener('resize', onViewportChange);
        window.removeEventListener('orientationchange', onViewportChange);
        try { container.removeEventListener && container.removeEventListener('scroll', onViewportChange as EventListener); } catch (_) {}
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      };
    }

    // Native implementation (React Native) - measure focused TextInput and scroll container
    const adjustNative = () => {
      try {
        // Try to obtain the currently focused input using TextInput state
        const State = (TextInput as any).State || (TextInput as any).TextInputState || (TextInput as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.TextInputState;
        const focused = State && (State.currentlyFocusedInput ? State.currentlyFocusedInput() : State.currentlyFocusedField && State.currentlyFocusedField());
        if (!focused) return;

        const inputHandle = typeof focused === 'number' ? focused : findNodeHandle(focused);
        if (!inputHandle) return;

        const container = containerRef && (containerRef as any).current;
        const containerHandle = container ? findNodeHandle(container) : null;

        if (containerHandle) {
          UIManager.measureLayout(
            inputHandle,
            containerHandle,
            () => {},
            (left: number, top: number, width: number, height: number) => {
              // top is the y position of the input relative to the container
              const targetY = Math.max(0, top - padding);
              try {
                if (typeof container.scrollTo === 'function') {
                  container.scrollTo({ y: targetY, animated: true });
                } else if (typeof container.scrollToOffset === 'function') {
                  container.scrollToOffset({ offset: targetY, animated: true });
                }
              } catch (e) {}
            }
          );
        } else {
          // No container provided: attempt to measure in window and let KeyboardAvoidingView adjust
          // Not much we can do without a scrollable container.
        }
      } catch (e) {
        // ignore measurement errors
      }
    };

    // Listen for keyboard show (user focused an input) and also for focus changes
    const kShow = Keyboard.addListener('keyboardDidShow', () => setTimeout(adjustNative, 50));
    const kHide = Keyboard.addListener('keyboardDidHide', () => { /* noop */ });

    // Some platforms may not emit keyboard events for focus—also attempt to
    // adjust on focus change via a polling/raf fallback when inputs gain focus.
    const focusPoll = setInterval(() => {
      adjustNative();
    }, 500);

    return () => {
      kShow.remove();
      kHide.remove();
      clearInterval(focusPoll as any);
    };
  }, [containerRef, padding, extraScroll, enabled]);
}
