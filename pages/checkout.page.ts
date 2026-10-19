import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export type PaymentMethod = 'cash-on-delivery';

export class CheckoutPage extends BasePage {
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByText(/Thanks for your order! Your invoice number is INV-\d+/);
  }

  async continueAsSignedInUser(): Promise<void> {
    await this.page.getByTestId('proceed-2').click();
  }

  billingField(field: 'country' | 'postal_code' | 'house_number' | 'street' | 'city' | 'state'): Locator {
    return this.page.getByTestId(field);
  }

  async continueWithBillingAddress(): Promise<void> {
    await this.page.getByTestId('proceed-3').click();
  }

  async pay(method: PaymentMethod): Promise<void> {
    await this.page.getByTestId('payment-method').selectOption(method);
    await this.page.getByTestId('finish').click();
  }

  async confirmOrder(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }
}
