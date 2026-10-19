import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ComparisonPage extends BasePage {
  readonly title: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('comparison-title');
    const table = page.getByTestId('comparison-table');
    this.productNames = table.getByTestId('product-name');
    this.prices = table.getByTestId('compare-price');
    this.removeButtons = table.getByTestId('remove-product');
  }

  async open(): Promise<void> {
    await this.goto('/comparison');
  }

  async removeFirst(): Promise<void> {
    await this.removeButtons.first().click();
  }
}
