import posts from "../../generated/content/posts.json";

export type BlogPost = (typeof posts)[number];

export function getBlogPost(
	slug: string,
	locale: string,
): BlogPost | null {
	return posts.find((p) => p.slug === slug && p.locale === locale) ?? null;
}

export function getAllBlogPosts(locale: string): BlogPost[] {
	return posts
		.filter((p) => p.locale === locale)
		.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllBlogSlugs(locale: string): string[] {
	return posts
		.filter((p) => p.locale === locale)
		.map((p) => p.slug);
}
