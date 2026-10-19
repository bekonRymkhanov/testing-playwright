import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { test as setup, expect } from '../fixtures/pages.fixture';
import { AccountPage } from '../pages/account.page';
import { AUTH_FILE } from '../playwright.config';

setup('authenticate a fresh customer', async ({ page, registeredUser, loginPage, accountPage }) => {
  await loginPage.open();
  await loginPage.signIn(registeredUser.email, registeredUser.password);

  await expect(page).toHaveURL(AccountPage.path);
  await expect(accountPage.title).toHaveText('My account');

  mkdirSync(dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
