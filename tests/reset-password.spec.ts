import { test, expect } from '../fixtures/pages.fixture';
import { uniqueEmail } from '../data/user.factory';

test.describe('TC-05 Reset a password', () => {
  test('a known e-mail gets a confirmation and the old password stops working', async ({
    page,
    forgotPasswordPage,
    registeredUser,
    usersApi,
  }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(registeredUser.email);

    await expect(forgotPasswordPage.result).toBeVisible();
    await expect(forgotPasswordPage.result).not.toContainText(/invalid/i);
    await expect(forgotPasswordPage.emailError).toBeHidden();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);

    await expect.poll(() => usersApi.login(registeredUser.email, registeredUser.password)).toBe(401);
  });

  test('an e-mail that is not registered gets an error', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(uniqueEmail('nobody'));

    await expect(forgotPasswordPage.result).toHaveText('The selected email is invalid.');
  });

  test('a malformed e-mail is rejected before reaching the server', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset('not-an-email');

    await expect(forgotPasswordPage.emailError).toBeVisible();
    await expect(forgotPasswordPage.result).toBeHidden();
  });
});
