import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  static readonly path = /\/account$/;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('page-title');
  }
}
