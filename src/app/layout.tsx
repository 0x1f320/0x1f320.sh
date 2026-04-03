import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const notoSerifKR = Noto_Serif_KR({
	variable: "--font-noto-serif-kr",
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	title: "0x1F320",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ko"
			className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKR.variable}`}
			suppressHydrationWarning
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
					}}
				/>
			</head>
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
