# Auth (login)
A reader signs in with email and password, or via Facebook, Google or phone number; recovery and registration are linked from the same form.

## Entry points
| Platform | From | Element (data-qa-id) | Lands on |
|---|---|---|---|
| Desktop | home, article, comments, report, search | `hd-login` "Masuk" | `/login` |
| Desktop/Mobile | any page | `hd-notification` (guest) | `/login` |
| Desktop/Mobile | article | `btn-like` (guest) | `/login` (fires CreateLike) |
| Mobile | burger menu | `anchor-login-wrapper` | login (listed in the menu overlay; click not recorded) |
| Both | login | `btn-forgot-password` "Lupa Password" | `/forgot-password` |
| Both | login | `btn-register` "Daftar Sekarang!" | `/register` |

## Flow
```mermaid
flowchart LR
  G[Guest page] -->|hd-login / hd-notification| L["/login"]
  M[Mobile] -->|burger-menu, anchor-login-wrapper| L
  L -->|btn-forgot-password| F["/forgot-password"]
  L -->|btn-register| R["/register"]
  L -.->|btn-save, Cloudflare check| S[signed-in: out of scope]
```

## Expected results (proof it worked)
- Login entry shows `input-email`, `input-password`, `right-add-on`, `eye` (digest: home `hd-login`).
- `eye` toggles to `eye-off` (digest: login `eye`).
- `btn-forgot-password` goes to `/forgot-password`; `btn-register` goes to `/register`.
- Header `hd-login`/`hd-notification` on `/login` itself: no visible effect.
- Social buttons (`btn-login-fb`, `btn-login-google`, `btn-login-phone`) and `btn-save` are present; the crawler did not activate them (protected).
- Signed-in outcome: out of scope (signing in needs a person at Cloudflare's "Verify you are human" check).

## Desktop vs mobile differences
- Desktop has `hd-login` "Masuk"; mobile reaches login through the burger menu (`anchor-login-wrapper`) or `hd-notification`.
- Mobile login page has no `hd-theme`, `hd-login` or `create-story` rows.
- Page objects: `LoginPage` (`email`, `password`, `submit`, `togglePasswordVisibility`, `socialLogins`, `hasBotChallenge`), `Header.goToLogin()`.

## Test ideas
Automated
- Login entry opens the form: TC-AUTH-001, TC-AGT-013 (mobile). Password toggle: TC-AUTH-006. Alternative methods and recovery links: TC-AUTH-007.
- Submit disabled with empty fields: TC-AUTH-002. Malformed email message (4 data rows): TC-AUTH-003. Cleared password message: TC-AUTH-004.
- Bot challenge before submit: TC-AUTH-005.

Ideas, not automated
- Very long email and whitespace-only password.
- Forgot-password and register pages (links are covered by TC-AUTH-007).

Out of scope
- Valid login, server-side wrong-password message, logout and session: out of scope (signing in needs a person at Cloudflare's "Verify you are human" check).

## Gotchas
- Login submit is behind a Cloudflare human check: never automate a real submit.
- Mobile: open the burger menu first; `close-sidebar` must be visible.
- `btn-save` is "Masuk" (submit), not a save action.

## Gaps
- Signed-in header, profile menu and logout: out of scope (Cloudflare human check on login).
- Destination of social buttons and phone login, and validation messages: not exercised.
- `/forgot-password` and `/register` contents were not recorded.
