import { test, expect } from '../fixtures/pages.fixture';
import { AccountPage } from '../pages/account.page';
import { createUser } from '../data/user.factory';

test.describe('TC-01 Register a new customer', () => {
  test('a unique new customer is created and can sign in with the new credentials', async ({
    page,
    registerPage,
    loginPage,
    accountPage,
  }) => {
    const user = createUser();

    await registerPage.open();
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/auth\/login$/);

    await loginPage.signIn(user.email, user.password);
    await expect(page).toHaveURL(AccountPage.path);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toHaveText(`${user.firstName} ${user.lastName}`);
  });

  test('registering with an e-mail that already exists is rejected', async ({ page, registerPage, registeredUser }) => {
    const duplicate = createUser({ email: registeredUser.email });

    await registerPage.open();
    await registerPage.register(duplicate);

    await expect(registerPage.registerError).toHaveText('A customer with this email address already exists.');
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test('submitting an empty form shows required-field errors', async ({ page, registerPage }) => {
    await registerPage.open();
    await registerPage.submitEmpty();

    await expect(registerPage.fieldError('first-name')).toHaveText('First name is required');
    await expect(registerPage.fieldError('last-name')).toHaveText('Last name is required');
    await expect(registerPage.fieldError('email')).toHaveText('Email is required');
    await expect(registerPage.fieldError('password')).toContainText('Password is required');
    await expect(page).toHaveURL(/\/auth\/register$/);
  });
});
