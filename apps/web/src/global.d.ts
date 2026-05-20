// Phase 2 Step 12 — typed messages (next-intl D-099 §2.6 type-safety).
//
// Augments the next-intl `IntlMessages` global so `t()` and component
// namespace strings get autocomplete + compile-time key checks. Catalogs are
// expected to be structurally identical; ja.json is the source of truth.

import type messages from "../messages/ja.json";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Omit<typeof messages, never> {}
}

export {};
