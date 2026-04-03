import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllBlogPosts } from "@/lib/blog";
import { BlogList } from "./blog-list";

export default async function BlogPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
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
