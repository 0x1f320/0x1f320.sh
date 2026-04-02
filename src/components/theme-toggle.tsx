"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
	const t = useTranslations("Theme");
	const { toggle } = useTheme();

	return (
		<button
			type="button"
			onClick={toggle}
			className="font-mono text-sm text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus:outline-none active:text-[var(--color-text)]"
		>
			<span className="dark:hidden">{t("dark")}</span>
			<span className="hidden dark:inline">{t("light")}</span>
		</button>
	);
}
