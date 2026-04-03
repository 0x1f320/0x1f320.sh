import { createOgImage } from "@/lib/og";
import { getBlogPost } from "@/lib/blog";
import { formatShortDate } from "@/lib/date";

export const alt = "0x1F320 Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;
	const post = getBlogPost(slug, locale);
	const title = post?.title ?? slug;
	const date = post ? formatShortDate(post.date, locale) : "";
	const readingTime = post?.readingTime ?? 0;
	const readingLabel =
		locale === "ko"
			? `읽는데 ${readingTime}분`
			: `${readingTime} min read`;

	return createOgImage(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
			}}
		>
			<div
				style={{
					fontFamily: "GeistMono",
					fontSize: 32,
					fontWeight: 400,
					color: "#71717a",
					letterSpacing: "-0.02em",
				}}
			>
				0x1F320
			</div>
			<div
				style={{
					fontFamily: "NotoSerifKR",
					fontSize: 56,
					fontWeight: 400,
					color: "#a1a1aa",
					letterSpacing: "-0.02em",
					textAlign: "right",
					maxWidth: "100%",
				}}
			>
				{title}
			</div>
			<div
				style={{
					display: "flex",
					fontFamily: "GeistMono",
					fontSize: 20,
					fontWeight: 400,
					color: "#71717a",
					letterSpacing: "-0.01em",
					marginTop: 8,
				}}
			>
				{date} · {readingLabel}
			</div>
		</div>,
		size,
	);
}
