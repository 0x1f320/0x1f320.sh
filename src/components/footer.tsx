"use client";

import { useLocale, useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";

const localeLabels = { ko: "KO", en: "EN" } as const;
type Locale = keyof typeof localeLabels;

const linkClassName =
	"font-mono text-sm text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus:outline-none active:text-[var(--color-text)]";

export function Footer() {
	const t = useTranslations("Home");
	const locale = useLocale() as Locale;
	const altLocale: Locale = locale === "ko" ? "en" : "ko";
	const pathname = usePathname();

	return (
		<footer className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Link href="/blog" className={linkClassName}>
					{t("blog")}
				</Link>
				<a
					href="https://github.com/0x1f320"
					target="_blank"
					rel="noopener noreferrer"
					className={linkClassName}
				>
					{t("github")}
				</a>
			</div>
			<div className="flex items-center gap-3">
				<Link href={pathname} locale={altLocale} className={linkClassName}>
					{localeLabels[altLocale]}
				</Link>
				<ThemeToggle />
			</div>
		</footer>
	);
}
