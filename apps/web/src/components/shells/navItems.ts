// The site navigation shared by the three shells (gamified / retro / terminal).
// Labels come from the `Nav` i18n namespace (`Nav.<key>`). D-181 §0-10 adds /sensei.

export const NAV_ITEMS = [
  { href: "/textbook", key: "textbook" },
  { href: "/quiz", key: "quiz" },
  { href: "/glossary", key: "glossary" },
  { href: "/sensei", key: "sensei" },
] as const;
