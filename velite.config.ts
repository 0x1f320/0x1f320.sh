import { defineConfig, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

const posts = {
	name: "Post" as const,
	pattern: "blog/**/*.mdx",
	schema: s
		.object({
			title: s.string().max(200),
			date: s.isodate(),
			description: s.string().max(300).optional(),
			metadata: s.metadata(),
			content: s.mdx(),
		})
		.transform((data, { meta }) => {
			const fileName = meta.basename ?? "";
			const match = fileName.match(/^(.+)\.(ko|en)\.mdx$/);
			const slug = match?.[1] ?? fileName.replace(/\.mdx$/, "");
			const locale = match?.[2] ?? "ko";

			return {
				...data,
				slug,
				locale,
				readingTime: data.metadata.readingTime,
			};
		}),
};

export default defineConfig({
	root: "content",
	output: {
		data: "generated/content",
		assets: "public/static",
		base: "/static/",
		clean: true,
	},
	collections: { posts },
	mdx: {
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
				},
			],
		],
	},
});
