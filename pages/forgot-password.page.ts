import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly email: Locator;
  readonly submit: Locator;
  readonly emailError: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.emailError = page.getByTestId('email-error');
    this.result = page.getByTestId('forgot-password-form').getByRole('alert');
  }

  async open(): Promise<void> {
    await this.goto('/auth/forgot-password');
  }

  async requestReset(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submit.click();
  }
}
