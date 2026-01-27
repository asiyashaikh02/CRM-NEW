
export const APP_CONFIG = {
  currency: {
    symbol: "₹",
    code: "INR",
    locale: "en-IN",
  },
  billing: {
    defaultAdvancePercentage: 15,
    gstRate: 18, // 18% GST
  },
  system: {
    name: "Synckraft",
    version: "2.2.0-Enterprise",
  }
};

/**
 * Enterprise utility for consistent currency formatting across the platform.
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(APP_CONFIG.currency.locale, {
    style: "currency",
    currency: APP_CONFIG.currency.code,
    maximumFractionDigits: 0,
  }).format(amount);
};
