import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllBlogPosts } from "@/lib/blog";
import { BlogList } from "./blog-list";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Blog" });
	const meta = await getTranslations({ locale, namespace: "Metadata" });
	const path = locale === "ko" ? "/blog" : "/en/blog";

	return {
		title: t("title"),
		description: meta("blogDescription"),
		alternates: {
			canonical: path,
			languages: {
				ko: "/blog",
				en: "/en/blog",
			},
		},
	};
}

export default async function BlogPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Blog");
	const posts = getAllBlogPosts(locale);

	return (
		<div>
			<h1 className="text-xl font-light text-[var(--color-text-muted)]">
				{t("title")}
			</h1>
			{posts.length === 0 ? (
				<p className="mt-8 text-sm text-[var(--color-text-subtle)]">
					{t("empty")}
				</p>
			) : (
				<BlogList
					posts={posts.map((p) => ({
						slug: p.slug,
						title: p.title,
						date: p.date,
						description: p.description,
					}))}
					locale={locale}
					compactOnLabel={t("compactOn")}
					compactOffLabel={t("compactOff")}
				/>
			)}
		</div>
	);
}
