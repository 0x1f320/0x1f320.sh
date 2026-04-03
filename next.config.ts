import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function getPortlessOrigins(): string[] {
	try {
		const output = execSync("portless list", {
			encoding: "utf-8",
			timeout: 3000,
		});
		return [...output.matchAll(/https:\/\/([\w.-]+\.localhost)\b/g)].map(
			(m) => m[1],
		);
	} catch {
		return [];
	}
}

const nextConfig: NextConfig = {
	allowedDevOrigins: getPortlessOrigins(),
};

export default withNextIntl(nextConfig);
