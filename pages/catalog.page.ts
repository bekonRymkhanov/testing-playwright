import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CatalogPage extends BasePage {
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.getByRole('link').filter({ has: page.getByTestId('product-name') });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(term);
    await this.page.getByTestId('search-submit').click();
  }

  async openFirstInStockProduct(options: { excluding?: string[] } = {}): Promise<void> {
    await this.open();
    let cards = this.productCards.filter({ hasNot: this.page.getByTestId('out-of-stock') });
    for (const name of options.excluding ?? []) {
      cards = cards.filter({ hasNot: this.page.getByTestId('product-name').getByText(name, { exact: true }) });
    }
    await cards.first().click();
  }

  async openProduct(name: string): Promise<void> {
    await this.open();
    await this.search(name);
    await this.productCards
      .filter({ has: this.page.getByTestId('product-name').getByText(name, { exact: true }) })
      .click();
  }
}
