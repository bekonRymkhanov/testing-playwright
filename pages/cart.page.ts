import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly lines: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.lines = page.getByRole('row').filter({ has: page.getByTestId('product-title') });
    this.total = page.getByTestId('cart-total');
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  line(productName: string) {
    const row = this.lines.filter({ hasText: productName });
    return {
      title: row.getByTestId('product-title'),
      quantity: row.getByTestId('product-quantity'),
      unitPrice: row.getByTestId('product-price'),
      linePrice: row.getByTestId('line-price'),
    };
  }

  async changeQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.line(productName).quantity;
    await input.fill(String(quantity));
    await input.press('Tab');
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
  }
}
