import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	description?: string;
	content: string;
	readingTime: number;
}

function estimateReadingTime(content: string): number {
	const text = content.replace(/```[\s\S]*?```/g, "").replace(/[#*`>\-|[\]()!]/g, "");
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export async function getBlogPost(
	slug: string,
	locale: string,
): Promise<BlogPost | null> {
	const filePath = path.join(CONTENT_DIR, `${slug}.${locale}.mdx`);

	try {
		const raw = await fs.readFile(filePath, "utf-8");
		const { data, content } = matter(raw);

		return {
			slug,
			title: data.title ?? slug,
			date: data.date ?? "",
			description: data.description,
			content,
			readingTime: estimateReadingTime(content),
		};
	} catch {
		return null;
	}
}

export async function getAllBlogPosts(locale: string): Promise<BlogPost[]> {
	let files: string[];
	try {
		files = await fs.readdir(CONTENT_DIR);
	} catch {
		return [];
	}

	const suffix = `.${locale}.mdx`;
	const slugs = files
		.filter((f) => f.endsWith(suffix))
		.map((f) => f.slice(0, -suffix.length));

	const posts = await Promise.all(
		slugs.map((slug) => getBlogPost(slug, locale)),
	);

	return posts
		.filter((p): p is BlogPost => p !== null)
		.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getAllBlogSlugs(locale: string): Promise<string[]> {
	let files: string[];
	try {
		files = await fs.readdir(CONTENT_DIR);
	} catch {
		return [];
	}

	const suffix = `.${locale}.mdx`;
	return files.filter((f) => f.endsWith(suffix)).map((f) => f.slice(0, -suffix.length));
}
