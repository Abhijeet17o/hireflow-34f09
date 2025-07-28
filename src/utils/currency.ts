export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate to convert from USD base price
}

// Supported currencies with current exchange rates (updated periodically)
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.52 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 149 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 75 }, // Updated for ₹150
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', exchangeRate: 5.1 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', exchangeRate: 17.2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', exchangeRate: 1.34 },
];

const BASE_USD_PRICE = 2; // $2 USD base price (reduced from $3)

export class CurrencyConverter {
  private selectedCurrency: Currency;

  constructor() {
    // Try to detect user's currency from browser/locale
    const userLocale = navigator.language || 'en-US';
    const detectedCurrency = this.detectCurrencyFromLocale(userLocale);
    this.selectedCurrency = detectedCurrency || SUPPORTED_CURRENCIES[0]; // Default to USD
  }

  private detectCurrencyFromLocale(locale: string): Currency | null {
    const currencyMap: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'ja-JP': 'JPY',
      'hi-IN': 'INR',
      'pt-BR': 'BRL',
      'es-MX': 'MXN',
      'en-SG': 'SGD',
      'de-DE': 'EUR',
      'fr-FR': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'nl-NL': 'EUR',
    };

    const currencyCode = currencyMap[locale] || currencyMap[locale.split('-')[0]];
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || null;
  }

  getCurrentCurrency(): Currency {
    return this.selectedCurrency;
  }

  setCurrency(currencyCode: string): void {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      this.selectedCurrency = currency;
      localStorage.setItem('selectedCurrency', currencyCode);
    }
  }

  convertPrice(usdPrice: number = BASE_USD_PRICE): number {
    const convertedPrice = usdPrice * this.selectedCurrency.exchangeRate;
    
    // Round to reasonable precision based on currency
    if (this.selectedCurrency.code === 'JPY') {
      return Math.round(convertedPrice); // No decimals for Yen
    }
    return Math.round(convertedPrice * 100) / 100; // 2 decimal places
  }

  formatPrice(usdPrice: number = BASE_USD_PRICE): string {
    const convertedPrice = this.convertPrice(usdPrice);
    const { symbol, code } = this.selectedCurrency;
    
    // Format based on currency conventions
    if (code === 'JPY') {
      return `${symbol}${convertedPrice.toLocaleString()}`;
    }
    
    return `${symbol}${convertedPrice.toFixed(2)}`;
  }

  getFormattedPriceWithSavings(): { price: string; savings: string; originalUSD: string } {
    const convertedPrice = this.convertPrice();
    const { symbol, code } = this.selectedCurrency;
    
    // Calculate "savings" compared to typical SaaS pricing ($29/month)
    const typicalPrice = this.convertPrice(29);
    const savings = typicalPrice - convertedPrice;
    
    return {
      price: this.formatPrice(),
      savings: code === 'JPY' ? `${symbol}${Math.round(savings).toLocaleString()}` : `${symbol}${savings.toFixed(2)}`,
      originalUSD: '$2.00 USD'
    };
  }

  // Initialize from localStorage if available
  loadSavedCurrency(): void {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      this.setCurrency(saved);
    }
  }
}

export const currencyConverter = new CurrencyConverter();

// Load saved currency preference on app start
currencyConverter.loadSavedCurrency();
