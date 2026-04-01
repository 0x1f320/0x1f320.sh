import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const suite = localFont({
	src: "../fonts/SUITE-Variable.woff2",
	variable: "--font-suite",
	display: "swap",
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
			className={`${geistSans.variable} ${geistMono.variable} ${suite.variable}`}
		>
			<body>{children}</body>
		</html>
	);
}
