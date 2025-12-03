// global.d.ts
declare const window: any;
declare const document: any;
interface VisualViewport {
 width: number;
 height: number;
 offsetTop: number;
 offsetLeft: number;
 scale?: number;
 addEventListener: any;
 removeEventListener: any;
}
// Evita errores de HTMLElement, que no existe en React Native
interface HTMLElement {
 scrollIntoView?: any;
 scrollBy?: any;
 scrollTop?: number;
 getBoundingClientRect?: any;
}