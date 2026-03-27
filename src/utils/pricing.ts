/**
 * Utility for premium pricing logic.
 * The business requirement is to adjust supplier prices by 10% for premium branding.
 */

const PREMIUM_MULTIPLIER = 1.10;

/**
 * Calculates the premium customer price based on the supplier's base price.
 * @param basePrice The original price from the supplier.
 * @returns The adjusted premium price rounded to 2 decimal places.
 */
export function calculatePremiumPrice(basePrice: number): number {
  return Math.round(basePrice * PREMIUM_MULTIPLIER * 100) / 100;
}

/**
 * Formats a number as a South African Rand (R) price.
 * @param price The amount to format.
 * @returns Formatted string (e.g., "R 19.99").
 */
export function formatPrice(price: number): string {
  return `R ${price.toFixed(2)}`;
}

/**
 * Type for a product with both base and premium pricing.
 */
export interface PricedProduct {
  basePrice: number;
  premiumPrice: number;
}
