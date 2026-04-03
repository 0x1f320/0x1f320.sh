import { createOgImage } from "@/lib/og";

export const alt = "0x1F320";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
	return createOgImage(
		<div
			style={{
				display: "flex",
				fontFamily: "GeistMono",
				fontSize: 44,
				fontWeight: 400,
				color: "#a1a1aa",
				letterSpacing: "-0.02em",
				marginTop: 4,
			}}
		>
			0x1F320
		</div>,
		size,
	);
}
