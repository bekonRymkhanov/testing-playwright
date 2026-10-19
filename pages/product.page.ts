import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductSnapshot {
  name: string;
  price: number;
}

export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly addedToCartToast: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addedToCartToast = this.toast('Product added to shopping cart');
  }

  async snapshot(): Promise<ProductSnapshot> {
    await expect(this.unitPrice).toHaveText(/\d+\.\d{2}/);
    return {
      name: (await this.name.innerText()).trim(),
      price: Number(await this.unitPrice.innerText()),
    };
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.page.getByTestId('add-to-cart').click();
  }

  async addToComparison(): Promise<void> {
    await this.page.getByTestId('add-to-compare').click();
  }
}
