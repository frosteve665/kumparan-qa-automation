# Like
A reader likes a story from the engagement bar; guests are asked to log in first.

## Entry points
| Platform | From | Element (data-qa-id) | Lands on |
|---|---|---|---|
| Desktop | article | `btn-like` "0" | `/login` (guest) |
| Mobile | article | `btn-like` "0" | `/login` (guest) |
| Both | video story | `btn-like-false`, `like-count` | seen in flow-map only, not clicked |

## Flow
```mermaid
flowchart LR
  A[Article] -->|btn-like guest, CreateLike fired| L["/login"]
  A -.->|signed-in: pending signed-in crawl| K[Like count +1, liked state]
```

## Expected results (proof it worked)
- Guest click on `btn-like` navigates to `/login` and shows `input-email`, `input-password`, `right-add-on`, `eye`.
- The `CreateLike` GraphQL operation is observed on that click (desktop and mobile).
- Count does not change for the guest (TC-LIKE-004).
- Signed-in outcome: pending signed-in crawl.

## Desktop vs mobile differences
- Same result. Mobile also renders `hd-notification`, `notification` while the login view loads.
- Page object: `ArticlePage.likeButton`, `likeCount()`, `isLiked()`, `tapLikeExpectingLogin()`, `toggleLike()`.

## Test ideas
Positive
- Signed-in like raises the count by one: TC-LIKE-001 (planned).
- Guest tap goes to login, count unchanged: TC-LIKE-004.
Negative
- Signed-in unlike restores the count: TC-LIKE-002 (planned).
Boundary
- Count display "0" and abbreviated counts via `parseCount`: NEW.
Edge
- Like persists after reload: TC-LIKE-003 (planned). Rapid double tap: TC-LIKE-005/006 (planned).
- Return to the story after login redirect lands on the same story: NEW.

## Gotchas
- `CreateLike` fires even though the user is redirected; do not read it as a successful like.
- `isLiked()` infers state from `aria-pressed` or class names; the real selector is unconfirmed.
- Signed-in likes change real data: use a dedicated test story and undo.

## Gaps
- Signed-in like and unlike behavior, error states and the liked-state markup.
- Whether the login redirect carries a return URL.
