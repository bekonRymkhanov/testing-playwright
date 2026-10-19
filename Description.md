# Description — SIS 2: Test Automation with Playwright

## What I want to do

Automate five end-to-end user journeys of the **Toolshop** demo application
(<https://practicesoftwaretesting.com>) with **Playwright + TypeScript** (`@playwright/test`),
structured the way the Week 6 lecture asks:

- **one spec per test case** (5 suites in `tests/`),
- **page objects** (`pages/`) that expose business actions, so **no spec contains a locator**,
- a **fixture layer** (`fixtures/pages.fixture.ts`) that hands page objects and fresh test data to every test,
- a **data factory** (`data/user.factory.ts`) that generates a **unique customer every run**,
- **log in once** (`tests/auth.setup.ts` + `storageState`) for the tests whose subject is not login,
- web-first assertions only — no `waitForTimeout`, no CSS classes, no positional XPath,
- every test independent, safe in **any order and in parallel** on a **shared public** application.

## Test cases to be automated

| ID | Suite (file) | Test case | What it must prove | Type |
|----|--------------|-----------|--------------------|------|
| TC-01.1 | `register.spec.ts` | Register a unique new customer | Account is created → user lands on the login page → can sign in with the new credentials and sees "My account" with own name | Positive |
| TC-01.2 | `register.spec.ts` | Register with an existing e-mail | Error "A customer with this email address already exists." and user stays on `/auth/register` | Negative |
| TC-01.3 | `register.spec.ts` | Submit an empty registration form | Required-field errors are shown, no navigation | Negative |
| TC-02.1 | `login.spec.ts` | Log in with valid credentials | URL `/account`, title "My account", user menu shows the customer's name, "Sign in" link is gone | Positive |
| TC-02.2 | `login.spec.ts` | Log in with a wrong password | Error "Invalid email or password", stays on `/auth/login`, still signed out | Negative |
| TC-02.3 | `login.spec.ts` | Log in with a malformed e-mail | Client-side errors "Email format is invalid" / "Password length is invalid" | Negative |
| TC-03.1 | `buy-product.spec.ts` | Buy a product | Add qty 2 → toast + cart badge "2" → cart shows the right item, quantity, unit price, line total and cart total → checkout (signed-in, billing address, Cash on Delivery) → "Payment was successful" → "Thanks for your order! … INV-…" | Positive (E2E) |
| TC-03.2 | `buy-product.spec.ts` | Change quantity in the cart | Line total, cart total and badge are recalculated for quantity 3 | Positive |
| TC-03.3 | `buy-product.spec.ts` | Thor Hammer limit (business rule) | Setting quantity 3 is refused: badge stays 1 and total stays at one unit | Negative |
| TC-04.1 | `compare-products.spec.ts` | Compare two products | Open Thor Hammer and Bolt Cutters, capture name + price from each product page, assert **Thor Hammer is cheaper than Bolt Cutters**, and the comparison table shows exactly the captured names and prices | Positive |
| TC-04.2 | `compare-products.spec.ts` | Remove a product from the comparison | Only the other product remains | Positive |
| TC-05.1 | `reset-password.spec.ts` | Reset password for a known e-mail | Confirmation alert, no error; the old password stops working (API login → 401) | Positive |
| TC-05.2 | `reset-password.spec.ts` | Reset password for an unknown e-mail | Error "The selected email is invalid." | Negative |
| TC-05.3 | `reset-password.spec.ts` | Reset password with a malformed e-mail | Client-side e-mail error, no server result shown | Negative |

## What I chose **not** to automate (and why)

- **Credit card / gift card / BNPL payment forms** — each has extra fields and validations. They're better covered as separate payment tests; one payment method is enough to prove "checkout completes".
- **Google sign-in** — third-party OAuth, not under test and not automatable reliably.
- **Favourites, account area, invoices, rentals, contact form, language switch** — outside the five required journeys.
- **Cross-browser (Firefox/WebKit)** — chromium only, to keep the run short on a shared public server. Adding a project in `playwright.config.ts` is a one-line change.
- **"Show differences only" on the comparison page** — during exploration it did not hide identical rows. It's unclear whether that's a bug or intended, so I did not encode either behaviour.
