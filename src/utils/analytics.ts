// Analytics tracking with Neon database integration
export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private readonly LOCAL_ANALYTICS_KEY = 'hireflow_analytics_backup';

  // Save to local storage as backup
  private saveToLocalStorage(event: AnalyticsEvent): void {
    try {
      const events = this.getLocalEvents();
      events.push(event);
      localStorage.setItem(this.LOCAL_ANALYTICS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getLocalEvents(): AnalyticsEvent[] {
    try {
      const data = localStorage.getItem(this.LOCAL_ANALYTICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  }

  // Save to Neon database via Netlify function
  private async saveToDatabase(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/save-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Analytics saved to database:', event.event);
    } catch (error) {
      console.error('❌ Failed to save analytics to database:', error);
      // Fallback to localStorage if database fails
      this.saveToLocalStorage(event);
    }
  }

  async track(
    event: string, 
    metadata?: Record<string, any>, 
    userInfo?: { id: string; email: string; name?: string }
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      userId: userInfo?.id,
      userEmail: userInfo?.email,
      userName: userInfo?.name,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent.substring(0, 100),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        clickCount: 1, // Track every click
      }
    };

    // Save to database first, fallback to localStorage
    await this.saveToDatabase(analyticsEvent);

    // Also save locally as backup
    this.saveToLocalStorage(analyticsEvent);

    // Log for debugging
    console.log('📊 Analytics Event:', analyticsEvent);
  }

  // Get events from localStorage (for immediate viewing)
  getLocalEventsByType(eventType: string): AnalyticsEvent[] {
    return this.getLocalEvents().filter((event: AnalyticsEvent) => event.event === eventType);
  }

  getAllLocalEvents(): AnalyticsEvent[] {
    return this.getLocalEvents();
  }

  getLocalConversionFunnel(): {
    upgradeClicks: number;
    pricingViews: number;
    buyNowClicks: number;
    feedbackSubmissions: number;
  } {
    const events = this.getLocalEvents();
    
    return {
      upgradeClicks: events.filter((e: AnalyticsEvent) => e.event === 'upgrade_button_clicked').length,
      pricingViews: events.filter((e: AnalyticsEvent) => e.event === 'pricing_page_viewed').length,
      buyNowClicks: events.filter((e: AnalyticsEvent) => e.event === 'buy_now_clicked').length,
      feedbackSubmissions: events.filter((e: AnalyticsEvent) => e.event === 'feedback_submitted').length,
    };
  }

  // Fetch analytics from database
  async getDatabaseAnalytics(): Promise<AnalyticsEvent[]> {
    try {
      const response = await fetch('/.netlify/functions/get-analytics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch database analytics:', error);
      // Fallback to localStorage
      return this.getLocalEvents();
    }
  }

  // Clear all analytics (admin function)
  async clearAllAnalytics(): Promise<void> {
    try {
      // Clear database
      await fetch('/.netlify/functions/clear-analytics', { method: 'POST' });
      
      // Clear localStorage
      localStorage.removeItem(this.LOCAL_ANALYTICS_KEY);
      
      console.log('🧹 All analytics cleared');
    } catch (error) {
      console.error('Failed to clear analytics:', error);
    }
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
  CURRENCY_CHANGED: 'currency_changed',
  PRICING_CALCULATED: 'pricing_calculated',
} as const;
