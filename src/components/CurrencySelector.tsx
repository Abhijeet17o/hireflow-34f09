import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { currencyConverter, SUPPORTED_CURRENCIES } from '../utils/currency';
import type { Currency } from '../utils/currency';
import { analytics, ANALYTICS_EVENTS } from '../utils/analytics';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  onCurrencyChange, 
  className = '' 
}) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencyConverter.getCurrentCurrency());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentCurrency(currencyConverter.getCurrentCurrency());
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    currencyConverter.setCurrency(currency.code);
    setCurrentCurrency(currency);
    setIsOpen(false);
    
    // Track currency change
    analytics.track(ANALYTICS_EVENTS.CURRENCY_CHANGED, {
      from: currentCurrency.code,
      to: currency.code,
      timestamp: new Date().toISOString(),
    });

    onCurrencyChange?.(currency);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Select currency"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="font-medium">{currentCurrency.symbol} {currentCurrency.code}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1 max-h-60 overflow-y-auto">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentCurrency.code === currency.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{currency.symbol} {currency.code}</span>
                    <div className="text-sm text-gray-500">{currency.name}</div>
                  </div>
                  {currentCurrency.code === currency.code && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
