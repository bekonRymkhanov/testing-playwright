import { test as base } from '@playwright/test';
import { AccountPage } from '../pages/account.page';
import { CartPage } from '../pages/cart.page';
import { CatalogPage } from '../pages/catalog.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ComparisonPage } from '../pages/comparison.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { RegisterPage } from '../pages/register.page';
import { UsersApi } from '../api/users.api';
import { createUser, User } from '../data/user.factory';

type Pages = {
  accountPage: AccountPage;
  cartPage: CartPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  comparisonPage: ComparisonPage;
  forgotPasswordPage: ForgotPasswordPage;
  loginPage: LoginPage;
  productPage: ProductPage;
  registerPage: RegisterPage;
};

type Data = {
  usersApi: UsersApi;
  registeredUser: User;
};

export const test = base.extend<Pages & Data>({
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  comparisonPage: async ({ page }, use) => use(new ComparisonPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),

  usersApi: async ({ request }, use) => use(new UsersApi(request)),
  registeredUser: async ({ usersApi }, use) => {
    const user = createUser();
    await usersApi.register(user);
    await use(user);
  },
});

export { expect } from '@playwright/test';
