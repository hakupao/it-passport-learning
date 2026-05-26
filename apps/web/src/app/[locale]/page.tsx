import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({
  params,
}: Props): Promise<void> {
  const { locale } = await params;
  redirect({ href: "/quiz", locale });
}
