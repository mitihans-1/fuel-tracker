export {}; // keep as module

// Global CSS imports
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module './globals.css'; // side-effect import for layout

declare global {
  interface GoogleMap { setCenter(pos: { lat: number; lng: number }): void; }
  interface GoogleMarker { setMap(map: GoogleMap | null): void; }
  interface Window {
    google?: {
      maps?: {
        Map: new (el: HTMLElement, opts: { center: { lat: number; lng: number }; zoom: number }) => GoogleMap;
        Marker: new (opts: { position: { lat: number; lng: number }; map: GoogleMap; title?: string }) => GoogleMarker;
      };
    };
  }
}
