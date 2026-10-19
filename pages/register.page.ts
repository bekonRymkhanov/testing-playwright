import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

export class RegisterPage extends BasePage {
  readonly submit: Locator;
  readonly registerError: Locator;

  constructor(page: Page) {
    super(page);
    this.submit = page.getByTestId('register-submit');
    this.registerError = page.getByTestId('register-error');
  }

  async open(): Promise<void> {
    await this.goto('/auth/register');
  }

  async register(user: User): Promise<void> {
    await this.page.getByTestId('first-name').fill(user.firstName);
    await this.page.getByTestId('last-name').fill(user.lastName);
    await this.page.getByTestId('dob').fill(user.dob);
    await this.page.getByTestId('country').selectOption(user.address.countryCode);
    await this.page.getByTestId('postal_code').fill(user.address.postalCode);
    await this.page.getByTestId('house_number').fill(user.address.houseNumber);
    await this.page.getByTestId('street').fill(user.address.street);
    await this.page.getByTestId('city').fill(user.address.city);
    await this.page.getByTestId('state').fill(user.address.state);
    await this.page.getByTestId('phone').fill(user.phone);
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.submit.click();
  }

  async submitEmpty(): Promise<void> {
    await this.submit.click();
  }

  fieldError(field: 'first-name' | 'last-name' | 'dob' | 'email' | 'password' | 'phone'): Locator {
    return this.page.getByTestId(`${field}-error`);
  }
}
