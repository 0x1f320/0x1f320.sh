"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const REPO = "0x1f320/0x1f320.sh";
const REPO_ID = "R_kgDOR3CrnQ";
const CATEGORY = "General";
const CATEGORY_ID = "DIC_kwDOR3Crnc4C5627";

export function Giscus({ locale }: { locale: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const loadedRef = useRef(false);
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	const giscusTheme = theme === "dark" ? "noborder_dark" : "noborder_light";
	const lang = locale === "ko" ? "ko" : "en";

	useEffect(() => {
		setMounted(true);
	}, []);

	const loadGiscus = useCallback(() => {
		const container = containerRef.current;
		if (!container || !mounted) return;

		container.innerHTML = "";

		const script = document.createElement("script");
		script.src = "https://giscus.app/client.js";
		script.setAttribute("data-repo", REPO);
		script.setAttribute("data-repo-id", REPO_ID);
		script.setAttribute("data-category", CATEGORY);
		script.setAttribute("data-category-id", CATEGORY_ID);
		script.setAttribute("data-mapping", "pathname");
		script.setAttribute("data-strict", "0");
		script.setAttribute("data-reactions-enabled", "1");
		script.setAttribute("data-emit-metadata", "0");
		script.setAttribute("data-input-position", "top");
		script.setAttribute("data-theme", giscusTheme);
		script.setAttribute("data-lang", lang);
		script.setAttribute("data-loading", "lazy");
		script.crossOrigin = "anonymous";
		script.async = true;

		loadedRef.current = true;
		container.appendChild(script);
	}, [giscusTheme, lang, mounted]);

	useEffect(() => {
		if (!mounted) return;

		if (!loadedRef.current) {
			loadGiscus();
			return;
		}

		const iframe = document.querySelector<HTMLIFrameElement>(
			"iframe.giscus-frame",
		);
		if (iframe) {
			iframe.contentWindow?.postMessage(
				{ giscus: { setConfig: { theme: giscusTheme } } },
				"https://giscus.app",
			);
		}
	}, [giscusTheme, mounted, loadGiscus]);

	return <div ref={containerRef} className="mt-16" />;
}
