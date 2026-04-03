import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeContent } from "./home-content";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const path = locale === "ko" ? "/" : "/en";

	return {
		alternates: {
			canonical: path,
			languages: {
				ko: "/",
				en: "/en",
			},
		},
	};
}

export default async function Page({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <HomeContent />;
}
