import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { routing } from "@/i18n/routing";
import { HtmlLang } from "./html-lang";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });

	return {
		description: t("siteDescription"),
		alternates: {
			canonical: locale === "ko" ? "/" : "/en",
			languages: {
				ko: "/",
				en: "/en",
			},
		},
	};
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) notFound();

	setRequestLocale(locale);

	return (
		<NextIntlClientProvider>
			<HtmlLang locale={locale} />
			<div className="mx-auto w-full max-w-[600px] px-6 py-8 sm:py-16">
				{children}
				<div className="mt-6">
					<Footer />
				</div>
			</div>
		</NextIntlClientProvider>
	);
}
