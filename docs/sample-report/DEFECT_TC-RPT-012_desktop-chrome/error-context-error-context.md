# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\report\TC-RPT-012_Keyboard_Report_Keeps_Form_Url.spec.ts >> [TC-RPT-012] Keyboard user opening the report form keeps the form URL in the address bar
- Location: tests\web\report\TC-RPT-012_Keyboard_Report_Keeps_Form_Url.spec.ts:9:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/report\/story\//
Received string:  "https://kumparan.com/kumparannews/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX/full"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="id-ID">…</html>
       - unexpected value "https://kumparan.com/kumparannews/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX/full"

```

```yaml
- complementary
- complementary
- complementary
- complementary
- banner:
  - link "Kumparan Logo":
    - /url: /
    - img "Kumparan Logo"
  - search:
    - text: Pencarian
    - img "search"
    - textbox "Pencarian":
      - /placeholder: Cari di sini...
  - navigation "user menu":
    - list:
      - listitem:
        - link "home":
          - /url: /
          - img "home"
      - listitem:
        - button "moon":
          - img "moon"
      - listitem:
        - link "notification":
          - /url: /notifications
          - img "notification"
      - listitem:
        - button "Masuk"
      - listitem:
        - button "Buat Tulisan"
  - navigation "headermain menu":
    - list:
      - listitem "viewport impression tracker":
        - link "News":
          - /url: /channel/news
      - listitem "viewport impression tracker":
        - link "Bisnis":
          - /url: /channel/bisnis
      - listitem "viewport impression tracker":
        - link "Entertainment":
          - /url: /channel/entertainment
      - listitem "viewport impression tracker":
        - link "Tekno":
          - /url: /channel/tekno
      - listitem "viewport impression tracker":
        - link "Food & Travel":
          - /url: /channel/food-travel
      - listitem "viewport impression tracker":
        - link "Mom":
          - /url: /channel/mom
      - listitem "viewport impression tracker":
        - link "Bola & Sports":
          - /url: /channel/bola-sports
      - listitem "viewport impression tracker":
        - link "Otomotif":
          - /url: /channel/otomotif
      - listitem "viewport impression tracker":
        - link "Woman":
          - /url: /channel/woman
      - listitem "viewport impression tracker":
        - link "Bolanita":
          - /url: /channel/bolanita
      - img "more-vertical"
      - text: Lainnya
  - navigation "header sub menu":
    - list:
      - listitem:
        - link "Breaking News":
          - /url: /breakingnews
      - listitem:
        - link "SATU Indonesia Awards":
          - /url: /topic/astra-satu-indonesia-awards
      - listitem:
        - link "Green Initiative":
          - /url: /topic/green-initiative
      - listitem:
        - link "Video Story":
          - /url: /video-story
      - listitem:
        - link "Audio Story":
          - /url: /audio-story
      - listitem:
        - link "Trending":
          - /url: /trending
      - listitem:
        - link "kumparanPLUS":
          - /url: /kumparan-plus
      - listitem:
        - link "Opini & Cerita":
          - /url: /opini-cerita
- main:
  - link "news-card-label-link":
    - /url: /kumparannews/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX
    - text: Pintu KRL Bogor Line Gangguan, 9 Perjalanan Terlambat hingga 32 Menit kumparanNEWS
    - img "verified-round"
  - link:
    - /url: /kumparannews/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX
  - text: Laporkan Konten Tim kumparan akan menggunakan laporan kamu untuk melakukan pengecekan terhadap konten ini. Spam, Komersial, atau Iklan
  - checkbox "Spam, Komersial, atau Iklan"
  - text: Memiliki unsur pornografi
  - checkbox "Memiliki unsur pornografi"
  - text: Membahayakan atau menjurus tindakan berbahaya
  - checkbox "Membahayakan atau menjurus tindakan berbahaya"
  - text: Mengandung konten kekerasan
  - checkbox "Mengandung konten kekerasan"
  - text: Menyinggung SARA
  - checkbox "Menyinggung SARA"
  - text: Lainnya
  - checkbox "Lainnya"
  - button "Batal"
  - button "Laporkan" [disabled]
```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Asserts the URL matches for the whole window, not just once. Web-first
  5  |  * toHaveURL passes on the first match, which hides a URL that is rewritten a
  6  |  * moment later (BUG-002).
  7  |  */
  8  | export async function expectUrlStays(page: Page, url: RegExp, forMs: number): Promise<void> {
  9  |   const deadline = Date.now() + forMs;
> 10 |   await expect(page).toHaveURL(url);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  11 |   while (Date.now() < deadline) {
  12 |     expect(page.url(), `URL must stay on ${url}`).toMatch(url);
  13 |     await page.waitForTimeout(250);
  14 |   }
  15 | }
  16 | 
```