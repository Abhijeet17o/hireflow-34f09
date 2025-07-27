// Simple analytics tracking for fake door testing
export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private readonly ANALYTICS_KEY = 'hireflow_analytics';

  private getEvents(): AnalyticsEvent[] {
    const data = localStorage.getItem(this.ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveEvents(events: AnalyticsEvent[]): void {
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(events));
  }

  track(event: string, metadata?: Record<string, any>, userInfo?: { id: string; email: string }): void {
    const events = this.getEvents();
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      userId: userInfo?.id,
      userEmail: userInfo?.email,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
      }
    };

    events.push(analyticsEvent);
    this.saveEvents(events);

    // Log for debugging
    console.log('📊 Analytics Event:', analyticsEvent);
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.getEvents().filter(event => event.event === eventType);
  }

  getAllEvents(): AnalyticsEvent[] {
    return this.getEvents();
  }

  getConversionFunnel(): {
    upgradeClicks: number;
    pricingViews: number;
    buyNowClicks: number;
    feedbackSubmissions: number;
  } {
    const events = this.getEvents();
    
    return {
      upgradeClicks: events.filter(e => e.event === 'upgrade_button_clicked').length,
      pricingViews: events.filter(e => e.event === 'pricing_page_viewed').length,
      buyNowClicks: events.filter(e => e.event === 'buy_now_clicked').length,
      feedbackSubmissions: events.filter(e => e.event === 'feedback_submitted').length,
    };
  }

  // For admin/debugging - clear all analytics
  clearAllEvents(): void {
    localStorage.removeItem(this.ANALYTICS_KEY);
    console.log('🧹 Analytics cleared');
  }
}

export const analytics = new AnalyticsTracker();

// Predefined event types for consistency
export const ANALYTICS_EVENTS = {
  UPGRADE_CLICKED: 'upgrade_button_clicked',
  PRICING_VIEWED: 'pricing_page_viewed',
  BUY_NOW_CLICKED: 'buy_now_clicked',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  DASHBOARD_VIEWED: 'dashboard_viewed',
} as const;
