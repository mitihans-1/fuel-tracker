// Global CSS imports
declare module "*.css" {}
declare module "*.scss" {}
declare module "*.sass" {}
declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}
declare module "*.module.scss" {
  const content: { [className: string]: string };
  export default content;
}
declare module "*.module.sass" {
  const content: { [className: string]: string };
  export default content;
}

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
