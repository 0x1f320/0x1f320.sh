import { createOgImage } from "@/lib/og";

export const alt = "0x1F320 Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const titles: Record<string, string> = {
	ko: "블로그",
	en: "Blog",
};

export default async function Image({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const title = titles[locale] ?? titles.ko;

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
				}}
			>
				{title}
			</div>
		</div>,
		size,
	);
}
