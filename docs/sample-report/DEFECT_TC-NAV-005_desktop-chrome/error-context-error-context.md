# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\navigation\TC-NAV-005_No_JavaScript_Errors.spec.ts >> [TC-NAV-005] Homepage loads without first-party JavaScript errors
- Location: tests\web\navigation\TC-NAV-005_No_JavaScript_Errors.spec.ts:4:1

# Error details

```
Error: uncaught errors on the homepage

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - complementary
  - complementary
  - generic [ref=e2]:
    - complementary
    - complementary
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic "kumparan logo" [ref=e5]:
          - link [ref=e6] [cursor=pointer]:
            - /url: /
            - img "Kumparan Logo" [ref=e7]
        - search [ref=e8]:
          - generic [ref=e9]: Pencarian
          - generic [ref=e11]:
            - img "search" [ref=e13]
            - textbox "Pencarian" [ref=e15]:
              - /placeholder: Cari di sini...
        - navigation "user menu" [ref=e16]:
          - list [ref=e17]:
            - listitem [ref=e18]:
              - link [ref=e21] [cursor=pointer]:
                - /url: /
                - img "home" [ref=e24]
            - listitem [ref=e25]:
              - button [ref=e28] [cursor=pointer]:
                - img "moon" [ref=e31]
            - listitem [ref=e32]:
              - link [ref=e36] [cursor=pointer]:
                - /url: /notifications
                - img "notification" [ref=e39]
            - listitem [ref=e40]:
              - button "Masuk" [ref=e41] [cursor=pointer]
            - listitem [ref=e45]:
              - button "Buat Tulisan" [ref=e47] [cursor=pointer]
      - navigation "headermain menu" [ref=e51]:
        - list [ref=e52]:
          - listitem "viewport impression tracker" [ref=e53]:
            - link "News" [ref=e54] [cursor=pointer]:
              - /url: /channel/news
          - listitem "viewport impression tracker" [ref=e57]:
            - link "Bisnis" [ref=e58] [cursor=pointer]:
              - /url: /channel/bisnis
          - listitem "viewport impression tracker" [ref=e61]:
            - link "Entertainment" [ref=e62] [cursor=pointer]:
              - /url: /channel/entertainment
          - listitem "viewport impression tracker" [ref=e65]:
            - link "Tekno" [ref=e66] [cursor=pointer]:
              - /url: /channel/tekno
          - listitem "viewport impression tracker" [ref=e69]:
            - link "Food & Travel" [ref=e70] [cursor=pointer]:
              - /url: /channel/food-travel
          - listitem "viewport impression tracker" [ref=e73]:
            - link "Mom" [ref=e74] [cursor=pointer]:
              - /url: /channel/mom
          - listitem "viewport impression tracker" [ref=e77]:
            - link "Bola & Sports" [ref=e78] [cursor=pointer]:
              - /url: /channel/bola-sports
          - listitem "viewport impression tracker" [ref=e81]:
            - link "Otomotif" [ref=e82] [cursor=pointer]:
              - /url: /channel/otomotif
          - listitem "viewport impression tracker" [ref=e85]:
            - link "Woman" [ref=e86] [cursor=pointer]:
              - /url: /channel/woman
          - listitem "viewport impression tracker" [ref=e89]:
            - link "Bolanita" [ref=e90] [cursor=pointer]:
              - /url: /channel/bolanita
          - generic [ref=e95] [cursor=pointer]:
            - img "more-vertical" [ref=e98]
            - generic [ref=e99]: Lainnya
      - navigation "header sub menu" [ref=e101]:
        - list [ref=e102]:
          - listitem [ref=e103]:
            - link "Breaking News" [ref=e104] [cursor=pointer]:
              - /url: /breakingnews
          - listitem [ref=e109]:
            - link "SATU Indonesia Awards" [ref=e110] [cursor=pointer]:
              - /url: /topic/astra-satu-indonesia-awards
          - listitem [ref=e115]:
            - link "Green Initiative" [ref=e116] [cursor=pointer]:
              - /url: /topic/green-initiative
          - listitem [ref=e121]:
            - link "Video Story" [ref=e122] [cursor=pointer]:
              - /url: /video-story
          - listitem [ref=e127]:
            - link "Audio Story" [ref=e128] [cursor=pointer]:
              - /url: /audio-story
          - listitem [ref=e133]:
            - link "Trending" [ref=e134] [cursor=pointer]:
              - /url: /trending
          - listitem [ref=e139]:
            - link "kumparanPLUS" [ref=e140] [cursor=pointer]:
              - /url: /kumparan-plus
          - listitem [ref=e145]:
            - link "Opini & Cerita" [ref=e146] [cursor=pointer]:
              - /url: /opini-cerita
    - main [ref=e151]:
      - generic [ref=e153]:
        - heading "kumparan.com - Bicara Fakta Lewat Berita" [level=1]
        - generic [ref=e158]:
          - button [ref=e160] [cursor=pointer]:
            - img "arrow-right" [ref=e163]
          - generic [ref=e164]:
            - generic "viewport impression tracker" [ref=e166]: Kilas Malam
            - generic "viewport impression tracker" [ref=e177]: Bisnis
            - generic "viewport impression tracker" [ref=e188]: Bolanita
            - generic "viewport impression tracker" [ref=e199]: Bola & Sports
            - generic "viewport impression tracker" [ref=e210]: Mom
            - generic "viewport impression tracker" [ref=e221]: Otomotif
            - generic "viewport impression tracker" [ref=e232]: Entertainment
            - generic "viewport impression tracker" [ref=e243]: Food & Travel
            - generic "viewport impression tracker" [ref=e254]: Tekno & Sains
            - generic "viewport impression tracker" [ref=e265]: News
            - generic "viewport impression tracker" [ref=e276]: Woman
        - generic [ref=e289]:
          - heading "Live Streaming" [level=2] [ref=e290]
          - generic "viewport impression tracker" [ref=e291]:
            - generic [ref=e294]:
              - generic "viewport impression tracker" [ref=e297]:
                - region "Video Player" [ref=e300]:
                  - application [ref=e301]
                  - generic [ref=e302] [cursor=pointer]
                  - button "Play Video" [ref=e304] [cursor=pointer]: 
                  - text:           
              - generic [ref=e306]: Tabrakan Imbas Karhutla hingga Bus EPA Persib Diserang
        - generic [ref=e311]:
          - generic "viewport impression tracker" [ref=e314]:
            - link "Karhutla di Indonesia 2026" [ref=e315] [cursor=pointer]:
              - /url: /topic/karhutla-di-indonesia-2026
          - generic "viewport impression tracker" [ref=e321]:
            - link "Rombongan Persib Diserang" [ref=e322] [cursor=pointer]:
              - /url: /topic/rombongan-persib-diserang
          - generic "viewport impression tracker" [ref=e328]:
            - link "Serangan Houthi ke Bandara Riyadh" [ref=e329] [cursor=pointer]:
              - /url: /topic/serangan-houthi-ke-riyadh
          - generic "viewport impression tracker" [ref=e335]:
            - link "Kasus Bullying di Telkom University" [ref=e336] [cursor=pointer]:
              - /url: /topic/kasus-bullying-di-telkom-university
        - generic [ref=e342]:
          - generic [ref=e345]:
            - generic [ref=e351]:
              - generic [ref=e353]:
                - generic "viewport impression tracker" [ref=e357]:
                  - generic [ref=e359]:
                    - img "Konpers Bahlil Lahadalia dan Maruarar Sirait" [ref=e363]
                    - generic [ref=e365]:
                      - link "news-card-label-link" [ref=e366] [cursor=pointer]:
                        - /url: /kumparanbisnis/bahlil-sebut-sebagian-sumur-rakyat-mulai-produksi-dan-jual-minyak-ke-kkks-28MSrQZEfxZ
                        - generic [ref=e367]: Bahlil Sebut Sebagian Sumur Rakyat Mulai Produksi dan Jual Minyak ke KKKS
                        - generic [ref=e370]:
                          - img "kumparanBISNIS" [ref=e376]
                          - generic [ref=e378]:
                            - generic [ref=e379]: kumparanBISNIS
                            - img "verified-round" [ref=e383]
                      - generic [ref=e384]: 5 menit
                - generic [ref=e388]:
                  - generic "viewport impression tracker" [ref=e392]:
                    - generic [ref=e394]:
                      - img "Agus Jabo Priyono minta Poltekesos Bandung" [ref=e398]
                      - generic [ref=e400]:
                        - link "news-card-label-link" [ref=e401] [cursor=pointer]:
                          - /url: /kumparannews/wamensos-agus-jabo-poltekesos-harus-jadi-soko-guru-sekolah-rakyat-28MVRAOPxSf
                          - generic [ref=e402]: "Wamensos Agus Jabo: Poltekesos Harus Jadi Soko Guru Sekolah Rakyat"
                          - generic [ref=e405]:
                            - img "kumparanNEWS" [ref=e411]
                            - generic [ref=e413]:
                              - generic [ref=e414]: kumparanNEWS
                              - img "verified-round" [ref=e418]
                        - generic [ref=e419]: 22 menit
                  - generic "viewport impression tracker" [ref=e426]:
                    - generic [ref=e428]:
                      - img "The Power of Mama di kawasan gambut Sungai Putri" [ref=e432]
                      - generic [ref=e434]:
                        - link "news-card-label-link" [ref=e435] [cursor=pointer]:
                          - /url: /kumparannews/dudung-soal-karhutla-tak-ditetapkan-bencana-nasional-kita-masih-mampu-atasi-28MV0uZKEdC
                          - generic [ref=e436]: "Dudung soal Karhutla Tak Ditetapkan Bencana Nasional: Kita Masih Mampu Atasi"
                          - generic [ref=e439]:
                            - img "kumparanNEWS" [ref=e445]
                            - generic [ref=e447]:
                              - generic [ref=e448]: kumparanNEWS
                              - img "verified-round" [ref=e452]
                        - generic [ref=e453]: 47 menit
              - generic [ref=e458]:
                - generic "viewport impression tracker" [ref=e462]:
                  - generic [ref=e464]:
                    - img "Agus Harimurti Yudhoyono" [ref=e468]
                    - generic [ref=e470]:
                      - link "news-card-label-link" [ref=e471] [cursor=pointer]:
                        - /url: /kumparannews/ahy-soroti-3-500-desa-belum-dapat-sinyal-internet-kuat-masih-blank-spot-28MTqkcOK07
                        - generic [ref=e472]: "AHY Soroti 3.500 Desa Belum Dapat Sinyal Internet Kuat: Masih Blank Spot"
                        - generic [ref=e475]:
                          - img "kumparanNEWS" [ref=e481]
                          - generic [ref=e483]:
                            - generic [ref=e484]: kumparanNEWS
                            - img "verified-round" [ref=e488]
                      - generic [ref=e489]: 58 menit
                - generic [ref=e493]:
                  - generic "viewport impression tracker" [ref=e497]:
                    - generic [ref=e499]:
                      - img "Agus Harimurti Yudhoyono" [ref=e503]
                      - generic [ref=e505]:
                        - link "news-card-label-link" [ref=e506] [cursor=pointer]:
                          - /url: /kumparannews/ahy-sebut-ri-bisa-jadi-hub-data-center-asia-tenggara-tapi-ingatkan-soal-air-28MTepg6pWv
                          - generic [ref=e507]: AHY Sebut RI Bisa Jadi Hub Data Center Asia Tenggara, tapi Ingatkan soal Air
                          - generic [ref=e510]:
                            - img "kumparanNEWS" [ref=e516]
                            - generic [ref=e518]:
                              - generic [ref=e519]: kumparanNEWS
                              - img "verified-round" [ref=e523]
                        - generic [ref=e524]: 2 jam
                  - generic "viewport impression tracker" [ref=e531]:
                    - generic [ref=e533]:
                      - img "Sidang eks Pangdam IV Diponegoro, Letjen TNI Widi Prasetijon" [ref=e537]
                      - generic [ref=e539]:
                        - link "news-card-label-link" [ref=e540] [cursor=pointer]:
                          - /url: /kumparannews/disebut-halal-letjen-widi-tak-tahu-uang-beli-mobil-jam-rolex-hasil-gratifikasi-28MR7fujlbP
                          - generic [ref=e541]: Disebut Halal, Letjen Widi Tak Tahu Uang Beli Mobil-Jam Rolex Hasil Gratifikasi
                          - generic [ref=e544]:
                            - img "kumparanNEWS" [ref=e550]
                            - generic [ref=e552]:
                              - generic [ref=e553]: kumparanNEWS
                              - img "verified-round" [ref=e557]
                        - generic [ref=e558]: 2 jam
              - generic [ref=e563]:
                - generic "viewport impression tracker" [ref=e567]:
                  - generic [ref=e569]:
                    - img "Kapolda Jawa Tengah Irjen Pol Roy Hardi Siahaan" [ref=e573]
                    - generic [ref=e575]:
                      - link "news-card-label-link" [ref=e576] [cursor=pointer]:
                        - /url: /kumparannews/kapolda-jateng-janji-tindak-tegas-anggota-yang-beking-narkoba-judi-28MTWwyy1Pa
                        - generic [ref=e577]: Kapolda Jateng Janji Tindak Tegas Anggota yang Beking Narkoba-Judi
                        - generic [ref=e580]:
                          - img "kumparanNEWS" [ref=e586]
                          - generic [ref=e588]:
                            - generic [ref=e589]: kumparanNEWS
                            - img "verified-round" [ref=e593]
                      - generic [ref=e594]: 2 jam
                - generic [ref=e598]:
                  - generic "viewport impression tracker" [ref=e602]:
                    - generic [ref=e604]:
                      - img "Ahmad Andalusi" [ref=e608]
                      - generic [ref=e610]:
                        - link "news-card-label-link" [ref=e611] [cursor=pointer]:
                          - /url: /kumparannews/cerita-driver-taksi-korban-begal-pamulang-duel-30-menit-hingga-ditusuk-10-kali-28MTBukLkeG
                          - generic [ref=e612]: "Cerita Driver Taksi Korban Begal Pamulang: Duel 30 Menit Hingga Ditusuk 10 Kali"
                          - generic [ref=e615]:
                            - img "kumparanNEWS" [ref=e621]
                            - generic [ref=e623]:
                              - generic [ref=e624]: kumparanNEWS
                              - img "verified-round" [ref=e628]
                        - generic [ref=e629]: 3 jam
                  - generic "viewport impression tracker" [ref=e636]:
                    - generic [ref=e638]:
                      - img "Anggota Komisi II DPR Ahmad Doli Kurnia" [ref=e642]
                      - generic [ref=e644]:
                        - link "news-card-label-link" [ref=e645] [cursor=pointer]:
                          - /url: /kumparannews/ada-pasal-selundupan-soal-ijazah-gibran-komisi-ii-eks-ketua-kpu-saling-bantah-28MSJVBiu9T
                          - generic [ref=e646]: Ada Pasal ‘Selundupan’ soal Ijazah Gibran, Komisi II-Eks Ketua KPU Saling Bantah
                          - generic [ref=e649]:
                            - img "kumparanNEWS" [ref=e655]
                            - generic [ref=e657]:
                              - generic [ref=e658]: kumparanNEWS
                              - img "verified-round" [ref=e662]
                        - generic [ref=e663]: 3 jam
            - img "chevron-next" [ref=e668] [cursor=pointer]
            - tablist [ref=e671]:
              - tab "Page 1" [ref=e672]
              - tab "Page 2" [ref=e673]
              - tab "Page 3" [ref=e674]
          - generic [ref=e676]:
            - generic [ref=e678]:
              - link [ref=e679] [cursor=pointer]:
                - /url: /trending
                - heading "Trending" [level=2] [ref=e680]
              - link "arrow-right Lihat lainnya" [ref=e682] [cursor=pointer]:
                - /url: /trending
                - generic [ref=e683]:
                  - img "arrow-right" [ref=e685]
                  - generic [ref=e686]: Lihat lainnya
            - list [ref=e689]:
              - listitem [ref=e690]:
                - generic "viewport impression tracker" [ref=e693]:
                  - generic [ref=e694]:
                    - generic [ref=e695]:
                      - link "news-card-label-link" [ref=e696] [cursor=pointer]:
                        - /url: /kumparannews/paguyuban-madura-datangi-polresta-yogya-gelar-istigasah-minta-kasus-distop-28MOvXAiY8p
                        - generic [ref=e697]: Paguyuban Madura Datangi Polresta Yogya, Gelar Istigasah Minta Kasus Distop
                        - generic [ref=e700]:
                          - img "kumparanNEWS" [ref=e706]
                          - generic [ref=e708]:
                            - generic [ref=e709]: kumparanNEWS
                            - img "verified-round" [ref=e713]
                      - generic [ref=e714]: 6 jam
                    - generic [ref=e718]:
                      - link:
                        - /url: /kumparannews/paguyuban-madura-datangi-polresta-yogya-gelar-istigasah-minta-kasus-distop-28MOvXAiY8p
                        - generic [ref=e719] [cursor=pointer]
              - listitem [ref=e723]:
                - generic "viewport impression tracker" [ref=e726]:
                  - generic [ref=e727]:
                    - generic [ref=e728]:
                      - link "news-card-label-link" [ref=e729] [cursor=pointer]:
                        - /url: /kumparannews/polisi-pelaku-penyerangan-bus-rombongan-epa-persib-positif-ganja-and-sabu-28MSWukBcQ0
                        - generic [ref=e730]: "Polisi: Pelaku Penyerangan Bus Rombongan EPA Persib Positif Ganja & Sabu"
                        - generic [ref=e733]:
                          - img "kumparanNEWS" [ref=e739]
                          - generic [ref=e741]:
                            - generic [ref=e742]: kumparanNEWS
                            - img "verified-round" [ref=e746]
                      - generic [ref=e747]: 3 jam
                    - generic [ref=e751]:
                      - link:
                        - /url: /kumparannews/polisi-pelaku-penyerangan-bus-rombongan-epa-persib-positif-ganja-and-sabu-28MSWukBcQ0
                        - generic [ref=e752] [cursor=pointer]
              - listitem [ref=e756]:
                - generic "viewport impression tracker" [ref=e759]:
                  - generic [ref=e760]:
                    - generic [ref=e761]:
                      - link "news-card-label-link" [ref=e762] [cursor=pointer]:
                        - /url: /kumparannews/ada-pasal-selundupan-soal-ijazah-gibran-komisi-ii-eks-ketua-kpu-saling-bantah-28MSJVBiu9T
                        - generic [ref=e763]: Ada Pasal ‘Selundupan’ soal Ijazah Gibran, Komisi II-Eks Ketua KPU Saling Bantah
                        - generic [ref=e766]:
                          - img "kumparanNEWS" [ref=e772]
                          - generic [ref=e774]:
                            - generic [ref=e775]: kumparanNEWS
                            - img "verified-round" [ref=e779]
                      - generic [ref=e780]: 3 jam
                    - generic [ref=e784]:
                      - link:
                        - /url: /kumparannews/ada-pasal-selundupan-soal-ijazah-gibran-komisi-ii-eks-ketua-kpu-saling-bantah-28MSJVBiu9T
                        - generic [ref=e785] [cursor=pointer]
              - listitem [ref=e789]:
                - generic "viewport impression tracker" [ref=e792]:
                  - generic [ref=e793]:
                    - generic [ref=e794]:
                      - link "news-card-label-link" [ref=e795] [cursor=pointer]:
                        - /url: /kumparannews/disebut-halal-letjen-widi-tak-tahu-uang-beli-mobil-jam-rolex-hasil-gratifikasi-28MR7fujlbP
                        - generic [ref=e796]: Disebut Halal, Letjen Widi Tak Tahu Uang Beli Mobil-Jam Rolex Hasil Gratifikasi
                        - generic [ref=e799]:
                          - img "kumparanNEWS" [ref=e805]
                          - generic [ref=e807]:
                            - generic [ref=e808]: kumparanNEWS
                            - img "verified-round" [ref=e812]
                      - generic [ref=e813]: 2 jam
                    - generic [ref=e817]:
                      - link:
                        - /url: /kumparannews/disebut-halal-letjen-widi-tak-tahu-uang-beli-mobil-jam-rolex-hasil-gratifikasi-28MR7fujlbP
                        - generic [ref=e818] [cursor=pointer]
              - listitem [ref=e822]:
                - generic "viewport impression tracker" [ref=e825]:
                  - generic [ref=e826]:
                    - generic [ref=e827]:
                      - link "news-card-label-link" [ref=e828] [cursor=pointer]:
                        - /url: /kumparannews/riyadh-diserang-jemaah-umrah-indonesia-diimbau-pantau-jadwal-penerbangan-28MQAVoVvRi
                        - generic [ref=e829]: Riyadh Diserang, Jemaah Umrah Indonesia Diimbau Pantau Jadwal Penerbangan
                        - generic [ref=e832]:
                          - img "kumparanNEWS" [ref=e838]
                          - generic [ref=e840]:
                            - generic [ref=e841]: kumparanNEWS
                            - img "verified-round" [ref=e845]
                      - generic [ref=e846]: 5 jam
                    - generic [ref=e850]:
                      - link:
                        - /url: /kumparannews/riyadh-diserang-jemaah-umrah-indonesia-diimbau-pantau-jadwal-penerbangan-28MQAVoVvRi
                        - generic [ref=e851] [cursor=pointer]
        - complementary [ref=e855]
```

# Test source

```ts
  1  | import { test, expect } from '../../../src/fixtures';
  2  | const CASE = '[TC-NAV-005] Homepage loads without first-party JavaScript errors';
  3  | 
  4  | test(
  5  |   CASE,
  6  |   {
  7  |     tag: ['@p2'],
  8  |     annotation: {
  9  |       type: 'issue',
  10 |       description: 'BUG-003: React hydration mismatch (error #418) on the desktop homepage',
  11 |     },
  12 |   },
  13 |   async ({ home, platform }) => {
  14 |     test.fail(platform === 'desktop', 'Known defect BUG-003 still reproduces on desktop');
  15 | 
  16 |     // Ads and analytics are blocked; only errors thrown by kumparan's own page count.
  17 |     const errors = await home.openCollectingErrors();
> 18 |     expect(errors, 'uncaught errors on the homepage').toEqual([]);
     |                                                       ^ Error: uncaught errors on the homepage
  19 |   },
  20 | );
  21 | 
```