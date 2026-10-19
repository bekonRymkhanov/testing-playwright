import { test, expect } from '../fixtures/pages.fixture';
import { AccountPage } from '../pages/account.page';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ page, loginPage, accountPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.signIn(registeredUser.email, registeredUser.password);

    await expect(page).toHaveURL(AccountPage.path);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toHaveText(`${registeredUser.firstName} ${registeredUser.lastName}`);
    await expect(accountPage.signInLink).toBeHidden();
  });

  test('a wrong password shows an error and does not sign in', async ({ page, loginPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.signIn(registeredUser.email, `${registeredUser.password}-wrong`);

    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.signInLink).toBeVisible();
  });

  test('a malformed e-mail is rejected by client-side validation', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.signIn('not-an-email', 'x');

    await expect(loginPage.emailError).toHaveText('Email format is invalid');
    await expect(loginPage.passwordError).toHaveText('Password length is invalid');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
