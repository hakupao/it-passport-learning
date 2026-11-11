// D-223 細目 — a link into a detail page (practice/q/<id>, glossary/<termId>): a plain <a> to the
// locale-prefixed URL, so the click is a full page load and nothing is prefetched (the family's .txt
// payloads are not deployed; lib/seo/detailLinks.ts). `locale` defaults to the page's.
import { useLocale } from "next-intl";

import { localeHref } from "@/lib/seo/detailLinks";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Locale-less `/practice/q/<id>` or `/glossary/<termId>`. */
  href: `/practice/q/${string}` | `/glossary/${string}`;
  locale?: string;
};

export function DetailLink({ href, locale, ...rest }: Props): React.ReactElement {
  const current = useLocale();
  return <a href={localeHref(locale ?? current, href)} {...rest} />;
}
