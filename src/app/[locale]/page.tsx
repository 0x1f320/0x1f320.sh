import { setRequestLocale } from "next-intl/server";
import { HomeContent } from "./home-content";

export default async function Page({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <HomeContent />;
}
