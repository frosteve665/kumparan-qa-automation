/**
 * kumparan serves two different front-ends: kumparan.com (desktop) and
 * m.kumparan.com (mobile). They share most data-qa-id values but differ in
 * layout and navigation (header button vs burger menu, inline share icons vs a
 * share modal). Page objects take the platform and hide those differences, so a
 * spec describes the business behavior once and runs on both.
 */
export type Platform = 'desktop' | 'mobile';
