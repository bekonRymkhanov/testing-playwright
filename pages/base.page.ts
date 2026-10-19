import { Locator, Page } from '@playwright/test';
import { LEGACY_API } from '../playwright.config';

export abstract class BasePage {
  readonly cartQuantity: Locator;
  readonly userMenu: Locator;
  readonly signInLink: Locator;

  constructor(protected readonly page: Page) {
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu');
    this.signInLink = page.getByTestId('nav-sign-in');
  }

  protected async goto(path: string): Promise<void> {
    await this.page.goto(LEGACY_API ? `/#${path}` : path);
  }

  protected toast(text: string | RegExp): Locator {
    return this.page.getByRole('alert').filter({ hasText: text });
  }
}
