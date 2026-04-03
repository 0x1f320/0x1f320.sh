import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog";
import { formatShortDate } from "@/lib/date";
import { routing } from "@/i18n/routing";
import { Giscus } from "@/components/giscus";
import { MDXContent } from "@/components/mdx-content";

type Props = {
	params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params;
	const post = getBlogPost(slug, locale);
	if (!post) return {};

	const path = locale === "ko" ? `/blog/${slug}` : `/en/blog/${slug}`;
	const languages: Record<string, string> = { ko: `/blog/${slug}` };
	if (getBlogPost(slug, "en")) languages.en = `/en/blog/${slug}`;

	return {
		title: post.title,
		description: post.description,
		alternates: {
			canonical: path,
			languages,
		},
	};
}

export async function generateStaticParams() {
	const params: { locale: string; slug: string }[] = [];

	for (const locale of routing.locales) {
		const slugs = getAllBlogSlugs(locale);
		for (const slug of slugs) {
			params.push({ locale, slug });
		}
	}

	return params;
}

export default async function BlogPostPage({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const post = getBlogPost(slug, locale);
	if (!post) notFound();

	const t = await getTranslations("Blog");

	const url = `https://0x1f320.sh${locale === "ko" ? "" : "/en"}/blog/${slug}`;
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		datePublished: post.date,
		...(post.description && { description: post.description }),
		url,
		inLanguage: locale,
		author: {
			"@type": "Person",
			name: "0x1F320",
			url: "https://0x1f320.sh",
		},
	};

	return (
		<article>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<header>
				<time className="text-sm text-[var(--color-text-subtle)]">
					{formatShortDate(post.date, locale)}
				</time>
				<h1 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
					{post.title}
				</h1>
				<p className="mt-1 text-sm text-[var(--color-text-subtle)]">
					{t("readingTime", { minutes: post.readingTime })}
				</p>
				{post.tags.length > 0 && (
					<p className="mt-2 text-sm text-[var(--color-text-subtle)]">
						{post.tags.map((tag) => t(`tags.${tag}`)).join(", ")}
					</p>
				)}
			</header>
			<div className="prose mt-8">
				<MDXContent code={post.content} />
			</div>
			<Giscus locale={locale} />
		</article>
	);
}
