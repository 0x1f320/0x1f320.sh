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
	metadataBase: new URL("https://0x1f320.sh"),
	title: {
		default: "0x1F320",
		template: "%s | 0x1F320",
	},
	twitter: {
		card: "summary_large_image",
	},
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
				<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="0x1F320" />
				<link rel="manifest" href="/site.webmanifest" />
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
