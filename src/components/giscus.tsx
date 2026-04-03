"use client";

import GiscusComponent from "@giscus/react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

export function Giscus({ locale }: { locale: string }) {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <div className="mt-16" />;

	return (
		<div className="mt-16">
			<GiscusComponent
				repo="0x1f320/0x1f320.sh"
				repoId="R_kgDOR3CrnQ"
				category="General"
				categoryId="DIC_kwDOR3Crnc4C5627"
				mapping="pathname"
				strict="0"
				reactionsEnabled="0"
				emitMetadata="0"
				inputPosition="top"
				theme={theme === "dark" ? "dark" : "light"}
				lang={locale === "ko" ? "ko" : "en"}
				loading="lazy"
			/>
		</div>
	);
}
