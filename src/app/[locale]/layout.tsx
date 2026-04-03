import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { routing } from "@/i18n/routing";
import { HtmlLang } from "./html-lang";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) notFound();

	setRequestLocale(locale);

	return (
		<NextIntlClientProvider>
			<HtmlLang locale={locale} />
			<div className="mx-auto w-full max-w-[600px] px-6 py-16">
				{children}
				<div className="mt-6">
					<Footer />
				</div>
			</div>
		</NextIntlClientProvider>
	);
}
