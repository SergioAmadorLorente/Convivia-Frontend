import { useEffect, useRef } from 'react';
import { Platform, Keyboard, findNodeHandle, UIManager, TextInput } from 'react-native';
/** Tipos seguros para Web sin romper RN */
type AnyHTMLElement = any;
type Options = {
 containerRef?: React.RefObject<AnyHTMLElement>;
 padding?: number;
 extraScroll?: number;
 enabled?: boolean;
};
/**
* useKeyboardAware
* Funciona tanto en Web (DOM) como en React Native nativo.
*/
export default function useKeyboardAware(options: Options = {}) {
 const { containerRef, padding = 12, extraScroll = 8, enabled = true } = options;
 const rafRef = useRef<number | null>(null);
 const lastActiveRef = useRef<any>(null);
 useEffect(() => {
   if (!enabled) return;
   const isWeb = Platform.OS === 'web' || typeof document !== 'undefined';
   /* ────────────────────────────────────────────────
    *                     WEB
    * ──────────────────────────────────────────────── */
   if (isWeb) {
     if (typeof window === 'undefined' || typeof document === 'undefined') return;
     const vv = window.visualViewport || null;
     const getContainer = (): AnyHTMLElement => {
       if (containerRef?.current) return containerRef.current;
       return document.scrollingElement || document.documentElement;
     };
     const isTextInput = (el: any) => {
       if (!el) return false;
       const tag = el.tagName;
       return (
         tag === 'INPUT' ||
         tag === 'TEXTAREA' ||
         el.isContentEditable
       );
     };
     const adjust = () => {
       if (rafRef.current) cancelAnimationFrame(rafRef.current);
       rafRef.current = requestAnimationFrame(() => {
         const active = document.activeElement as AnyHTMLElement | null;
         if (!active || !isTextInput(active)) return;
         lastActiveRef.current = active;
         const container = getContainer();
         const rect = active.getBoundingClientRect();
         const viewportHeight = vv ? vv.height : window.innerHeight;
         const viewportOffsetTop = vv ? vv.offsetTop || 0 : 0;
         const elementBottom = rect.bottom - viewportOffsetTop;
         const safeAreaBottom = viewportHeight - padding;
         if (elementBottom <= safeAreaBottom) return;
         const overlap = elementBottom - safeAreaBottom + extraScroll;
         try {
           // Scroll del contenedor o ventana
           if (
             container === document.documentElement ||
             container === document.body ||
             container === document.scrollingElement
           ) {
             window.scrollBy?.({ top: overlap, behavior: 'smooth' });
           } else {
             container.scrollBy?.({ top: overlap, behavior: 'smooth' });
           }
           // Asegura visibilidad final
           setTimeout(() => {
             try {
               active.scrollIntoView({
                 block: 'nearest',
                 inline: 'nearest',
                 behavior: 'smooth',
               });
             } catch {}
           }, 50);
         } catch {
           try { active.scrollIntoView({ block: 'nearest' }); } catch {}
         }
       });
     };
     const onFocusIn = () => setTimeout(adjust, 50);
     const onFocusOut = () => { lastActiveRef.current = null; };
     const onViewportChange = () => setTimeout(adjust, 50);
     document.addEventListener('focusin', onFocusIn);
     document.addEventListener('focusout', onFocusOut);
     if (vv) {
       vv.addEventListener('resize', onViewportChange);
       vv.addEventListener('scroll', onViewportChange);
     }
     window.addEventListener('resize', onViewportChange);
     window.addEventListener('orientationchange', onViewportChange);
     const container = getContainer();
     container?.addEventListener?.('scroll', onViewportChange, { passive: true });
     return () => {
       document.removeEventListener('focusin', onFocusIn);
       document.removeEventListener('focusout', onFocusOut);
       if (vv) {
         vv.removeEventListener('resize', onViewportChange);
         vv.removeEventListener('scroll', onViewportChange);
       }
       window.removeEventListener('resize', onViewportChange);
       window.removeEventListener('orientationchange', onViewportChange);
       container?.removeEventListener?.('scroll', onViewportChange);
       if (rafRef.current) cancelAnimationFrame(rafRef.current);
     };
   }
   /* ────────────────────────────────────────────────
    *               REACT NATIVE (iOS/Android)
    * ──────────────────────────────────────────────── */
   const adjustNative = () => {
     try {
       const State =
         (TextInput as any).State ||
         (TextInput as any).TextInputState ||
         (TextInput as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.TextInputState;
       const focused = State?.currentlyFocusedInput
         ? State.currentlyFocusedInput()
         : State?.currentlyFocusedField?.();
       if (!focused) return;
       const inputHandle = typeof focused === 'number' ? focused : findNodeHandle(focused);
       if (!inputHandle) return;
       const container = containerRef?.current;
       const containerHandle = container ? findNodeHandle(container) : null;
       if (containerHandle) {
         UIManager.measureLayout(
           inputHandle,
           containerHandle,
           () => {},
           (left: number, top: number) => {
             const targetY = Math.max(0, top - padding);
             try {
               container.scrollTo?.({ y: targetY, animated: true });
               container.scrollToOffset?.({ offset: targetY, animated: true });
             } catch {}
           }
         );
       }
     } catch {}
   };
   const kShow = Keyboard.addListener('keyboardDidShow', () => {
     setTimeout(adjustNative, 50);
   });
   const kHide = Keyboard.addListener('keyboardDidHide', () => {});
   const focusPoll = setInterval(() => {
     adjustNative();
   }, 500);
   return () => {
     kShow.remove();
     kHide.remove();
     clearInterval(focusPoll);
   };
 }, [containerRef, padding, extraScroll, enabled]);
}