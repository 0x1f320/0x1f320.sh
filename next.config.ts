import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	allowedDevOrigins: ["blog-md-articles.0x1f320.localhost"],
};

export default withNextIntl(nextConfig);
