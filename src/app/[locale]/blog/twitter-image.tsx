import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "0x1F320 Blog";
export const size = { width: 1200, height: 600 };
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
	const [geistMono, notoSerifKR] = await Promise.all([
		readFile(join(process.cwd(), "src/fonts/GeistMono-Regular.ttf")),
		readFile(join(process.cwd(), "src/fonts/NotoSerifKR-Regular.ttf")),
	]);

	const title = titles[locale] ?? titles.ko;

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					background: "#1c1917",
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
					justifyContent: "flex-end",
					padding: 64,
					gap: 0,
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="-5 -10 95 75"
					width="115"
					height="90"
				>
					{/* Big star (behind) */}
					<path
						fill="#e8e0d8"
						d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L78,3 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
					/>
					{/* Small star — background stroke for knockout */}
					<path
						fill="none"
						stroke="#1c1917"
						strokeWidth="5"
						strokeLinejoin="round"
						transform="translate(10, -8) scale(0.75)"
						d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L68,8 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
					/>
					{/* Small star — fill (on top) */}
					<path
						fill="#e8e0d8"
						transform="translate(10, -8) scale(0.75)"
						d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L68,8 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
					/>
				</svg>
				<div
					style={{
						fontFamily: "GeistMono",
						fontSize: 24,
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
						fontSize: 44,
						fontWeight: 400,
						color: "#a1a1aa",
						letterSpacing: "-0.02em",
					}}
				>
					{title}
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{
					name: "GeistMono",
					data: geistMono,
					style: "normal",
					weight: 400,
				},
				{
					name: "NotoSerifKR",
					data: notoSerifKR,
					style: "normal",
					weight: 400,
				},
			],
		},
	);
}
