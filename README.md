# SIS 2: Playwright test automation for the Toolshop

[![Playwright Tests](https://github.com/bekonRymkhanov/testing-playwright/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/bekonRymkhanov/testing-playwright/actions/workflows/playwright.yml)

End-to-end tests for <https://practicesoftwaretesting.com>, written with **Playwright + TypeScript**.

| Document | Content |
|---|---|
| [`Description.md`](Description.md) | Goal and the list of automated test cases |
| [`Review.md`](Review.md) | What the AI got wrong, how it was reviewed and corrected, and why |
| [`screenshots/`](screenshots) | Run results, HTML report, buggy-build run |
| [`CI-REPORT.md`](CI-REPORT.md) | SIS 3: CI pipeline report with screenshots, run links and AI appendix |

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

## CI

**CI system:** GitHub Actions. The repository already lives on GitHub, so there is no server to run,
it is free for public repositories, and a `matrix` gives sharding in two lines.

**Pipeline** ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)):

- runs on every push (any branch), every pull request, and manually (`workflow_dispatch`);
- `npm ci` with the npm cache (`setup-node` `cache: npm`), then `tsc --noEmit`;
- starts the Toolshop app in Docker ([`docker-compose.ci.yml`](docker-compose.ci.yml),
  [`scripts/start-app.sh`](scripts/start-app.sh)), see *Why the app runs inside CI* below;
- installs Chromium with system dependencies and runs the **full** suite, split into 4 shards
  (`--shard=i/4`) that run in parallel;
- the `Merge reports` job merges the shards' blob reports into one HTML report and one JUnit file;
- artefacts, kept 14 days: `playwright-report` (HTML with traces), `test-results-1..4`
  (traces, screenshots, videos, `error-context.md`, JUnit, and `app.log` if the job failed),
  `junit-report`.

**CI settings** (`playwright.config.ts`, only when `CI` is set): `forbidOnly: true`, `retries: 2`,
`workers: 2`, reporters `list` + `github` (failure annotations) + `blob` + `junit`.
Always on: `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.

### Why the app runs inside CI

The first run was red: the public site answers GitHub's runners with a Cloudflare
"Performing security verification" page (HTTP 403 even for `curl`), while it works from a home
connection. A grader forking the repository would hit the same wall. So CI starts the same app
(official `testsmith/practice-software-testing-sprint5-*` images, pinned to `2.5`) on the runner
and points the tests at it with `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`.
Locally nothing changes: without those variables the tests still use the public site.
No secrets or repository variables are needed.

### What blocks a merge and what only reports

`main` requires the four `Tests (shard i/4)` checks to pass. A shard fails, and so blocks the
merge, when:

- a test fails on all 3 attempts (a real bug or a broken test);
- someone committed `test.only` (`forbidOnly`);
- the code does not type-check, `package-lock.json` is out of sync (`npm ci`), or the app does not
  start.

Only reported, never blocking:

- **flaky tests:** a test that passes on retry keeps the job green but shows as *flaky* in the HTML
  report, with the trace of the failed attempt. Blocking on flakes trains people to press
  "re-run" instead of reading results; reporting them keeps them visible to fix;
- **the `Merge reports` job:** it only builds the report. If it broke, the test result is still
  known from the shards;
- **runtime** and runner warnings;
- **the buggy build** (`npm run test:bugs`): it is supposed to fail, so it stays a manual run.

The line: block on anything that means `main` is broken for the next person; report everything that
helps diagnose, but would only add noise as a gate.

### Runtime

Same workflow, measured on GitHub Actions, median of 3 `workflow_dispatch` runs.

| Configuration | Total run time | Run tests step (slowest shard) | Runs |
| --- | --- | --- | --- |
| 1 job, no sharding | 1 min 34 s | 16 s | [94 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42657212762), [104 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42657886367), [92 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42658201078) |
| 4 shards + merge | 1 min 59 s | 13 s | [114 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42658805842), [123 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42659139285), [119 s](https://github.com/bekonRymkhanov/testing-playwright/actions/runs/42659514253) |

**Conclusion:** sharding cut the test step only from 16 s to 13 s, but made the whole run 25 s
*slower*: the suite (14 tests) takes ~16 s, while every shard repeats about a minute of setup
(starting the app ~37 s, Chromium ~17 s, npm), and the merge job runs after them for another ~17 s. Sharding pays off once the suite runs for minutes;
here it is kept to show the mechanism, and `shardTotal` is one line to change.

### Running locally

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test          # CI config against the public site

# the same app as in CI (Docker):
./scripts/start-app.sh
CI=true BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test
```

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
playwright.config.ts         baseURL, testIdAttribute=data-test, trace on-first-retry, CI-only settings
merge.config.ts              merges the shards' blob reports into HTML + JUnit (CI)
docker-compose.ci.yml        the Toolshop app for CI; scripts/start-app.sh starts it
.github/workflows/           the CI pipeline
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
