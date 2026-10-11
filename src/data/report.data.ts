export const REPORT_REASONS = [
  'Spam, Komersial, atau Iklan',
  'Memiliki unsur pornografi',
  'Membahayakan atau menjurus tindakan berbahaya',
  'Mengandung konten kekerasan',
  'Menyinggung SARA',
  'Lainnya',
] as const;

/** Index of "Lainnya" (Other), which also needs a written reason. */
export const OTHER_REASON = 5;

export const REPORT = {
  otherReasonText: 'Judul tidak sesuai isi berita',
  missingStorySlug: 'qa-automation-story-that-does-not-exist-00000000000',
} as const;
