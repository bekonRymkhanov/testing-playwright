# Review: what the AI produced, what was wrong, and what was changed

## 1. What the AI produced

From the single prompt in `Prompt.md`, Claude Code (Opus 5.5) produced a complete Playwright +
TypeScript project:

- `playwright.config.ts` with the four settings from the lecture (`baseURL`,
  `testIdAttribute: 'data-test'`, `trace: 'on-first-retry'`, `retries` in CI only), plus a `setup`
  project for log-in-once.
- 9 page objects (`pages/`), one fixture file (`fixtures/pages.fixture.ts`), a data factory
  (`data/user.factory.ts`) and a small API helper (`api/users.api.ts`).
- 5 spec files with 14 tests, plus `tests/auth.setup.ts`.
- These documents, a GitHub Actions workflow, and the screenshots.

The first version was **not** correct. The first full run gave **12 passed / 2 failed**. Later
repeated and parallel runs exposed more problems. Every problem below was found by **running the
suite and reading the evidence** (failure screenshot, Playwright's `error-context.md` DOM snapshot,
the trace's network log). None of them was found by trusting the generated code.

## 2. Review method

| Check | How it was verified |
|---|---|
| Suite actually runs | `npx playwright test` from a clean state; `npx tsc --noEmit` for types |
| Not flaky | `--repeat-each 3` / `--repeat-each 5` on the buy tests, `--repeat-each 2` on the whole suite, all with 5 parallel workers |
| No locator in any spec | `grep -nE "getBy\|locator\(\|page\.goto\|\.nth\(" tests/*.spec.ts` → no matches |
| No `waitForTimeout` | `grep -rn waitForTimeout pages tests fixtures api data` → no matches (only the git-ignored exploration scripts use it) |
| No CSS classes / XPath | grep for `locator(`, `xpath`, `.class` → no matches; all locators are `getByTestId` / `getByRole` / `getByText` |
| Assertions can fail | Ran against the deliberately buggy build (`npm run test:bugs`) → **11 of 15 fail** (section 4) |
| Every test asserts something meaningful | Read each test: every one ends in a web-first `expect` on a business outcome, not just "page loaded" |

## 3. Problems found and corrections made

### 3.1 Seeded accounts are not safe to use, so every test creates its own customer
**AI's first idea (from the slides):** use `customer@practicesoftwaretesting.com / welcome01` for login,
and the seeded account for the "known e-mail" in the reset-password test.

**What exploration showed:** `POST /users/forgot-password` really **changes the password to
`welcome02`**. The agent verified it: after a reset, the old password gets 401 and `welcome02` gets 200.
During the same session, `customer2@…/welcome01` was **already failing** with
"Invalid email or password", because another user of this shared site had reset it.

**Decision:** a `registeredUser` fixture registers a **brand-new customer through the API** for each
test that needs one (`POST /users/register`, unique e-mail from the factory). Login, reset-password,
the duplicate-email check and the log-in-once setup all use their own customer. This makes the suite
independent of other students, and it no longer destroys the seeded accounts for everyone else.
The trade-off: one extra API call per test.

### 3.2 Thor Hammer quantity test: wrong product chosen by the AI
**AI's first version:** "change quantity to 3 in the cart" used **Thor Hammer**.
**Failure:** line total showed `$33.42`, but the cart total stayed `$11.14` and the badge stayed `1`.
**Root cause (network log):** `PUT /carts/{id}/product/quantity` → `400 "You can only have one Thor
Hammer in the cart."`. The product description says so too.
**Correction:** the quantity test now uses an ordinary in-stock product. Then the business rule
became **its own negative test** (TC-03.3): badge and total must not change.
**Bug noted:** the UI still shows the rejected `$33.42` line total with no error. That's
inconsistent with the cart total.

### 3.3 Checkout failed at "Confirm": invalid billing address
**Failure:** after "Payment was successful", clicking Confirm never showed the order confirmation.
**Root cause:** `POST /invoices` → `422 "The city does not belong to the selected country."`. The
made-up profile address (Almaty, KZ, 050000) passes registration but not invoice validation.
Invoice validation matches the city against the app's own `/postcode-lookup`.

**First fix (also by the AI) was flaky:** type the postcode and house number in checkout, then
wait for the lookup. It failed in **4 of 5** repeated runs. The trace's network log showed
`postcode-lookup?country=KZ&postcode=1011AB`: the checkout loads the profile address
**asynchronously** and sometimes overwrote the edited country and house number.
**Final fix:** test customers are registered with an address the lookup itself resolves
(`NL / 1011AB / 5 → Autarboulevard, Stroe, Groningen`). Checkout pre-fills a valid address, so the
test simply **asserts the pre-fill** (country, postcode, city, house number) and continues. That
assertion is also a real check of the "billing address is pre-filled from the profile" behaviour.
Result: 5/5 green on repeat.

### 3.4 "Buy a product" broke when the product sold out
**Failure:** `locator.fill: element is not enabled` on the quantity input.
**Root cause:** Combination Pliers had become **out of stock** (`in_stock: false` from the API).
The suite's own checkouts and other users' purchases consume stock on the shared shop.
**Correction:** `CatalogPage.openFirstInStockProduct()` picks the first card without the
`out-of-stock` marker, excluding Thor Hammer. The test then **captures the name and price from the
product page** and asserts against those, so it no longer hard-codes a product.

### 3.5 Country dropdown label
**Failure:** `selectOption({ label: 'Netherlands' })`: "did not find some options".
**Correction:** select by ISO code (`'NL'`). That's the option value, and it's what the API
receives anyway, so it can't drift with translations.

### 3.6 Smaller review changes
- The `PaymentMethod` type first listed five values the AI had **guessed**. It was reduced to the
  one value actually observed (`cash-on-delivery`), so the code claims nothing it hasn't verified.
- The reset-password success message on the live site is the **raw i18n key**
  `page.forgot-password.confirm`: a translation bug in the app. Asserting that exact text would
  encode the bug; asserting the "proper" sentence would make the suite permanently red. The test
  asserts what matters instead: an alert is shown, it is not an error, there is no validation error,
  **and the side effect happened** (the old password now returns 401 from the API).
- Comparison prices are captured with `snapshot()` (a query) only to **state the comparison**. All
  checks on the page use retrying assertions (`toHaveText([...])`), as the lecture recommends.
- `tsconfig.json`: TypeScript 7 removed `moduleResolution: node`, so it was switched to `bundler`.
  Exploration and trace folders are excluded from the type check.

## 4. Proof that the assertions assert: run against the buggy build

`npm run test:bugs` runs the same suite against `with-bugs.practicesoftwaretesting.com`. That build is
an older release (hash routing, flat user schema), so the suite has two small env switches
(`LEGACY_API=1`). Result: **4 passed, 11 failed**. For example:

| Test | Failure on the buggy build |
|---|---|
| Change quantity in cart | line total **`$00.00`** instead of `$42.45` (injected bug) |
| Buy a product | "Product added to shopping cart" toast never appears |
| Valid login | user menu doesn't show the customer's name |
| Malformed e-mail on login | no "Email format is invalid" message |
| Empty registration form | message is `" First name is required. "`: different text |
| Reset password, unknown e-mail | "The selected email is invalid." not shown |
| Compare products | the old build has no compare feature: test cannot proceed |

Not every failure is an injected bug; some come from the older version's different UI. But it shows
the suite fails loudly when the application is wrong. It does not just replay clicks.

## 5. What I would still improve
- Run Firefox and WebKit projects in CI.
- Cover the other payment methods as a data-driven test.
- Report the three app bugs found (raw i18n key on reset, misleading Thor Hammer line total,
  "show differences only" not hiding equal rows).
