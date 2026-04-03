import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function BlogPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Blog");

	return (
		<h1 className="text-xl font-light text-[var(--color-text-muted)]">
			{t("title")}
		</h1>
	);
}
