/**
 * Shared checkout/billing errors.
 *
 * Lives in its own module so both checkout.ts and playBilling.ts can import it
 * without creating a circular dependency (checkout.ts imports playBilling.ts).
 */
export class CheckoutCancelled extends Error {
  constructor() {
    super('Payment cancelled.');
    this.name = 'CheckoutCancelled';
  }
}
