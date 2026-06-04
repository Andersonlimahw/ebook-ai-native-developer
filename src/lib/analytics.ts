/**
 * Analytics Interface representing the abstraction layer (Dependency Inversion Principle).
 * Any new analytics provider must implement this interface to be compatible with our system.
 */
export interface AnalyticsProvider {
  /**
   * Initializes the analytics provider (e.g. injecting scripts into the DOM).
   */
  initialize(): void;

  /**
   * Tracks a page view event.
   * @param path The URL path of the page (e.g., '/01-llm')
   * @param title The title of the page
   */
  trackPageView(path: string, title?: string): void;

  /**
   * Tracks a custom event.
   * @param name The name of the event (e.g., 'menu_click')
   * @param params Additional custom parameters for the event
   */
  trackEvent(name: string, params?: Record<string, any>): void;
}

/**
 * Console/Dummy Provider for local development or fallback when no ID is configured.
 * Follows the Null Object Pattern to prevent null pointer exceptions.
 */
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  initialize(): void {
    console.log('[Analytics] Initialized Console provider. Tracking is active in development mode.');
  }

  trackPageView(path: string, title?: string): void {
    console.log(`[Analytics] Page View -> Path: ${path}, Title: ${title || (typeof document !== 'undefined' ? document.title : '')}`);
  }

  trackEvent(name: string, params?: Record<string, any>): void {
    console.log(`[Analytics] Event -> Name: ${name}`, params);
  }
}

/**
 * Google Analytics 4 (GA4) Provider using standard gtag.js.
 */
export class GA4AnalyticsProvider implements AnalyticsProvider {
  private measurementId: string;
  private isInitialized = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    if (!this.measurementId || this.measurementId.includes('PLACEHOLDER')) {
      console.warn('[Analytics] GA4 Measurement ID is a placeholder. Skipping script injection.');
      return;
    }

    // Load gtag script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    
    // Define gtag function conforming to GTM requirements
    function gtag() {
      win.dataLayer.push(arguments);
    }
    win.gtag = win.gtag || gtag;

    win.gtag('js', new Date());
    // Disable automatic page_view tracking since we will control it manually
    win.gtag('config', this.measurementId, {
      send_page_view: false
    });

    this.isInitialized = true;
  }

  trackPageView(path: string, title?: string): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    const win = window as any;
    if (typeof win.gtag === 'function') {
      win.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href
      });
    }
  }

  trackEvent(name: string, params?: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    const win = window as any;
    if (typeof win.gtag === 'function') {
      win.gtag('event', name, params);
    }
  }
}

/**
 * Google Tag Manager (GTM) Provider.
 */
export class GTMAnalyticsProvider implements AnalyticsProvider {
  private gtmId: string;
  private isInitialized = false;

  constructor(gtmId: string) {
    this.gtmId = gtmId;
  }

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    if (!this.gtmId || this.gtmId.includes('PLACEHOLDER')) {
      console.warn('[Analytics] GTM ID is a placeholder. Skipping script injection.');
      return;
    }

    // Standard GTM script injection snippet
    (function(w: any, d: any, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const f = d.getElementsByTagName(s)[0];
      if (!f || !f.parentNode) return;
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', this.gtmId);

    this.isInitialized = true;
  }

  trackPageView(path: string, title?: string): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    });
  }

  trackEvent(name: string, params?: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: name,
      ...params
    });
  }
}

/**
 * AnalyticsManager following the Service Locator/Singleton pattern.
 * Manages the active provider and delegates tracking calls to it.
 */
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private provider: AnalyticsProvider;

  private constructor() {
    // Default fallback to console provider to ensure safe operations
    this.provider = new ConsoleAnalyticsProvider();
  }

  /**
   * Retrieves the singleton instance of the manager.
   */
  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Configures and initializes the active analytics provider.
   * This allows changing providers dynamically at runtime (Open-Closed Principle).
   */
  public setProvider(provider: AnalyticsProvider): void {
    this.provider = provider;
    this.provider.initialize();
  }

  /**
   * Tracks page view using the configured provider.
   */
  public trackPageView(path: string, title?: string): void {
    try {
      this.provider.trackPageView(path, title);
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  /**
   * Tracks a custom event using the configured provider.
   */
  public trackEvent(name: string, params?: Record<string, any>): void {
    try {
      this.provider.trackEvent(name, params);
    } catch (error) {
      console.error(`[Analytics] Failed to track event '${name}':`, error);
    }
  }
}

// GTM/GA4 ID Placeholder - User will update this manually.
// Can be a GA4 measurement ID (starts with 'G-') or a GTM ID (starts with 'GTM-').
export const ANALYTICS_ID = 'GTM-TM42HT44';

// Export the singleton instance of the manager for global usage
export const analytics = AnalyticsManager.getInstance();
