# SIS 2: Playwright test automation for the Toolshop

End-to-end tests for <https://practicesoftwaretesting.com>, written with **Playwright + TypeScript**.

| Document | Content |
|---|---|
| [`Description.md`](Description.md) | Goal and the list of automated test cases |
| [`Review.md`](Review.md) | What the AI got wrong, how it was reviewed and corrected, and why |
| [`screenshots/`](screenshots) | Run results, HTML report, buggy-build run |

## Run it

```bash
npm ci
npx playwright install chromium
npx playwright test          # whole suite, parallel
npx playwright show-report   # HTML report
npx playwright test --ui     # UI mode
npm run test:bugs            # same suite against the deliberately buggy build (expected to fail)
```

Requires Node 18+. No credentials or local setup are needed: every test creates its own customer.

## Structure

```
tests/
  auth.setup.ts              log in ONCE, save storageState (playwright/.auth/user.json)
  register.spec.ts           TC-01 Register a new customer
  login.spec.ts              TC-02 Log in
  buy-product.spec.ts        TC-03 Buy a product (uses the saved session)
  compare-products.spec.ts   TC-04 Compare two products
  reset-password.spec.ts     TC-05 Reset a password
pages/                       one page object per screen: business actions, no assertions on intent
fixtures/pages.fixture.ts    page objects + usersApi + registeredUser (fresh customer per test)
data/user.factory.ts         unique customer per call (timestamp + uuid e-mail)
data/products.ts             product names used by the tests
api/users.api.ts             register / login through the REST API (fast test-data setup)
playwright.config.ts         baseURL, testIdAttribute=data-test, trace on-first-retry, retries in CI
```

## Decisions

- **No locator in any spec.** Specs talk to page objects (`loginPage.signIn(...)`) and assert on
  locators the page object exposes (`loginPage.loginError`).
- **`data-test` attributes** via `testIdAttribute`, plus `getByRole` / `getByText`. No CSS
  classes, no XPath, no `.nth()` in specs.
- **No `waitForTimeout`.** Only web-first assertions and auto-waiting actions; `expect.poll` for the
  one API-side check.
- **Fresh customer per test**, registered through the API. Forgot-password really changes the
  password on this shared site, so seeded accounts get broken by other users (see `Review.md` §3.1).
- **Log in once:** a `setup` project signs in through the UI once and saves `storageState`. Only the
  buy-product suite opts into it. Login and registration tests must start signed out.
- **Stock-independent purchase test:** the product is the first in-stock card. Its name and price
  are captured from the page, not hard-coded (`Review.md` §3.4).
- **Independent and parallel:** `fullyParallel: true`. Every test creates its own data, and cart and
  comparison state are per browser context.

## Not automated

See `Description.md`: other payment methods, Google sign-in, favourites/account/rentals, and
cross-browser (one config line away).
