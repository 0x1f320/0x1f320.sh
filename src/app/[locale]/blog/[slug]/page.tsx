import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { Giscus } from "@/components/giscus";

export async function generateStaticParams() {
	const params: { locale: string; slug: string }[] = [];

	for (const locale of routing.locales) {
		const slugs = await getAllBlogSlugs(locale);
		for (const slug of slugs) {
			params.push({ locale, slug });
		}
	}

	return params;
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const post = await getBlogPost(slug, locale);
	if (!post) notFound();

	const t = await getTranslations("Blog");

	return (
		<article>
			<header>
				<time className="text-sm text-[var(--color-text-subtle)]">
					{post.date}
				</time>
				<h1 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
					{post.title}
				</h1>
				<p className="mt-1 text-sm text-[var(--color-text-subtle)]">
					{t("readingTime", { minutes: post.readingTime })}
				</p>
			</header>
			<div className="prose mt-8">
				<MDXRemote
					source={post.content}
					options={{
						mdxOptions: {
							remarkPlugins: [remarkGfm],
							rehypePlugins: [
								[
									rehypePrettyCode,
									{
										theme: {
											dark: "github-dark-default",
											light: "github-light-default",
										},
										keepBackground: false,
									defaultLang: { inline: "plaintext", block: "plaintext" },
									},
								],
							],
						},
					}}
				/>
			</div>
			<Giscus locale={locale} />
		</article>
	);
}
