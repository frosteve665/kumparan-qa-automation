# Comment
A reader opens a story's comment thread and, once signed in, writes a comment; guests can see the thread.

## Entry points
| Platform | From | Element (data-qa-id) | Lands on |
|---|---|---|---|
| Desktop | article | `btn-comment` "0" | `/kumparannews/response/:story-slug` |
| Mobile | article | `btn-comment` "0" | `/kumparannews/response/:story-slug` |

## Flow
```mermaid
flowchart LR
  A[Article] -->|btn-comment| T["/kumparannews/response/:story-slug"]
  T -->|type in input-comment, guest| D[Draft, no login prompt OBS-001]
  T -->|btn-send-comment guest| N[No visible effect, protected]
  T -.->|signed-in: out of scope| P[Comment posted]
```

## Expected results (proof it worked)
- Thread shows `selected-commented-card`, `comment-input-card`, `input-comment`, `comment-editor-border`, text "Belum ada komentar" (empty story); API FindPinCommentByStoryID.
- Comment count on the article matches the thread (TC-CMT-002).
- `btn-send-comment` as guest: no visible effect (desktop and mobile).
- Header `hd-notification`/`hd-login` on this page lead to `/login`.

## Desktop vs mobile differences
- Desktop comments page has `hd-logo`, `hd-home`, `input-search`, `hd-theme`; mobile has burger menu, `hd-search` and bottom nav (`nb-*`).
- Page object: `CommentPage` (`commentedStory`, `section`, `inputCard`, `input`, `editor`, `sendButton`, `emptyState`).

## Test ideas
Automated
- Comment button opens the thread: TC-CMT-001. Count matches the thread: TC-CMT-002.
- Guest typing publishes nothing (no comment request is sent): TC-CMT-004. Send is never clicked in this project.

Observation
- OBS-001: a guest can draft a full comment with no login prompt.

Out of scope
- Signed-in drafting (empty, whitespace-only, very long, emoji) and replies/edit/delete: out of scope (signing in needs a person at Cloudflare's "Verify you are human" check).

## Gotchas
- Never click `btn-send-comment`; the assignment forbids submitting.
- The editor is `textarea#comment-editor` inside `input-comment`.
- `emptyState` (`no-comment`) only exists when the story has zero comments.

## Gaps
- Populated threads, replies, likes on comments, pinned comments.
- Signed-in composer behavior and validation messages.
