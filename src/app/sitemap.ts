import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";

const BASE_URL = "https://0x1f320.sh";

export default function sitemap(): MetadataRoute.Sitemap {
	const entries: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			alternates: {
				languages: {
					ko: BASE_URL,
					en: `${BASE_URL}/en`,
				},
			},
		},
		{
			url: `${BASE_URL}/blog`,
			lastModified: new Date(),
			alternates: {
				languages: {
					ko: `${BASE_URL}/blog`,
					en: `${BASE_URL}/en/blog`,
				},
			},
		},
	];

	const koPosts = getAllBlogPosts("ko");
	const enSlugs = new Set(getAllBlogPosts("en").map((p) => p.slug));

	for (const post of koPosts) {
		const languages: Record<string, string> = {
			ko: `${BASE_URL}/blog/${post.slug}`,
		};
		if (enSlugs.has(post.slug)) {
			languages.en = `${BASE_URL}/en/blog/${post.slug}`;
		}

		entries.push({
			url: `${BASE_URL}/blog/${post.slug}`,
			lastModified: new Date(post.date),
			alternates: { languages },
		});
	}

	return entries;
}
