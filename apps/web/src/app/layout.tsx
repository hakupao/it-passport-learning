// Phase 2 Step 12 — root layout simplified to pass-through (D-099 §2.5 LD-7).
//
// With the [locale] segment owning <html>/<body> + NextIntlClientProvider, the
// root layout has nothing to add. Next.js still requires app/layout.tsx to
// exist; this minimal form satisfies the requirement without conflicting with
// the locale-scoped layout in app/[locale]/layout.tsx.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
