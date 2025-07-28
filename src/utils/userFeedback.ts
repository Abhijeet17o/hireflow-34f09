// User feedback and interest collection
export interface UserFeedback {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  timestamp: string;
  responses: {
    mostImportantFeatures?: string;
    biggestChallenge?: string;
    willingToPay?: string;
    additionalFeatures?: string;
    contactForUpdates?: boolean;
  };
  source: 'pricing_page' | 'dashboard' | 'other';
}

class UserFeedbackManager {
  private readonly FEEDBACK_KEY = 'hireflow_user_feedback';

  private getFeedback(): UserFeedback[] {
    const data = localStorage.getItem(this.FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveFeedback(feedback: UserFeedback[]): void {
    localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(feedback));
  }

  submitFeedback(
    responses: UserFeedback['responses'],
    userInfo?: { id: string; email: string; name: string },
    source: UserFeedback['source'] = 'pricing_page'
  ): UserFeedback {
    const feedback = this.getFeedback();
    
    const newFeedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userInfo?.id,
      userEmail: userInfo?.email,
      userName: userInfo?.name,
      timestamp: new Date().toISOString(),
      responses,
      source,
    };

    feedback.push(newFeedback);
    this.saveFeedback(feedback);

    // Save to database
    this.saveToDatabase(newFeedback);

    console.log('📝 Feedback submitted:', newFeedback);
    return newFeedback;
  }

  // Save to Neon database via Netlify function
  private async saveToDatabase(feedback: UserFeedback): Promise<void> {
    try {
      const payload = {
        userName: feedback.userName,
        userEmail: feedback.userEmail,
        responses: feedback.responses,
        timestamp: feedback.timestamp
      };

      const response = await fetch('/.netlify/functions/save-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Feedback saved to database:', feedback.id);
    } catch (error) {
      console.error('❌ Failed to save feedback to database:', error);
      // Don't throw - local storage already worked
    }
  }

  getAllFeedback(): UserFeedback[] {
    return this.getFeedback();
  }

  getFeedbackStats(): {
    totalSubmissions: number;
    sources: Record<string, number>;
    willingToPayBreakdown: Record<string, number>;
    topFeatures: Record<string, number>;
  } {
    const feedback = this.getFeedback();
    
    const sources = feedback.reduce((acc, f) => {
      acc[f.source] = (acc[f.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const willingToPayBreakdown = feedback.reduce((acc, f) => {
      if (f.responses.willingToPay) {
        acc[f.responses.willingToPay] = (acc[f.responses.willingToPay] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Simple keyword extraction for top features
    const topFeatures = feedback.reduce((acc, f) => {
      if (f.responses.mostImportantFeatures) {
        const features = f.responses.mostImportantFeatures.toLowerCase().split(/[,\s]+/);
        features.forEach(feature => {
          if (feature.length > 3) { // Ignore short words
            acc[feature] = (acc[feature] || 0) + 1;
          }
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSubmissions: feedback.length,
      sources,
      willingToPayBreakdown,
      topFeatures,
    };
  }

  // For admin/debugging
  clearAllFeedback(): void {
    localStorage.removeItem(this.FEEDBACK_KEY);
    console.log('🧹 User feedback cleared');
  }
}

export const userFeedback = new UserFeedbackManager();
