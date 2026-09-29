# Signup and social sign-in release

This change replaces broken role-selection links with a shared two-step signup form for professionals, companies and agencies. Email/password signup remains available. Login and email verification use the same visual design. Unconfigured social providers are disabled with an explanation.

## Deploy together

Deploy the matching backend signup/social-auth change before this frontend. The backend branch builds on the earlier account-permissions and review-privacy change. Neither pull request is production acceptance for the whole marketplace.

Frontend environment:
- Keep the existing backend API setting pointed at the matching backend (BACKEND_URL or the currently configured API variable).
- Set SITE_ORIGIN=https://www.contractpros.co.uk. Use this canonical origin for the login journey, including redirects from the apex domain.
- Do not put provider secrets in NEXT_PUBLIC variables. All provider credentials belong on the backend.

Register these exact provider callback addresses:
- Google: https://www.contractpros.co.uk/api/social/google/callback
- Apple: https://www.contractpros.co.uk/api/social/apple/callback
- Facebook: https://www.contractpros.co.uk/api/social/facebook/callback

Apple returns a cross-site form POST. Its temporary browser-binding cookie therefore uses Secure, HttpOnly and SameSite=None; the completed account session uses SameSite=Lax. A canonical HTTPS origin is required. The next signup screen retains the selected account type.

## What is verified

Run the production build with `npm run build -- --webpack` and the server-route checks with `node --test tests/social-routes.cjs`.

The browser regression script is `tests/signup-browser.cjs`. It requires Playwright and Chrome and deliberately rejects non-local base URLs. Start the backend's `tests.browser_server` fixture with CONTRACTPROS_LOCAL_TESTS=1, start this frontend on port 3100 with BACKEND_URL=http://127.0.0.1:8001 and SITE_ORIGIN=http://127.0.0.1:3100, then run the browser script. Use TEST_MAIL_FILE consistently on both sides. The fixture captures verification emails locally and cannot send real email. Set PLAYWRIGHT_MODULE if Playwright is installed outside this project. TEST_OUTPUT chooses the screenshot/report directory.

Browser checks cover signup, required fields, password visibility, email resend, verification, login, session cookie and logout for all three roles. They also check mobile overflow and social cancellation messages. The fixture exposes authentication APIs only; marketplace dashboard data is not part of this test.

Social server-route checks cover configuration, safe provider redirects, Apple form-post cookies, callback handling, role retention, cancellation, CSRF rejection and keeping session tokens out of browser-readable JSON.

## Still required before enabling providers

Real Apple, Google and Facebook credentials have not been supplied. Provider API responses are simulated in automated tests. Actual consent, provider approval, production email delivery and production sign-in must be checked on the canonical HTTPS site with approved test accounts before treating any social provider as live-tested. See the backend's SOCIAL-SIGNIN.md for configuration and migration notes.

Accounts with an existing email address are not silently linked to another provider. Those users must use their original sign-in method. Explicit account linking is a separate feature.
