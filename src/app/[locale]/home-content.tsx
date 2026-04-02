"use client";

import { useLocale, useTranslations } from "next-intl";
import { StarParticles } from "@/components/star-particles";
import { ThemeToggle } from "@/components/theme-toggle";
import { generateInitial, useScrambleText } from "@/hooks/use-scramble-text";
import { Link } from "@/i18n/navigation";

const PREFIX = "0x";
const SUFFIX = "1F320";

const localeLabels = { ko: "KO", en: "EN" } as const;
type Locale = keyof typeof localeLabels;

export function HomeContent() {
	const t = useTranslations();
	const locale = useLocale() as Locale;
	const ref = useScrambleText(SUFFIX);

	const bioLines = t("Home.bio").split("\n");
	const altLocale: Locale = locale === "ko" ? "en" : "ko";

	return (
		<div className="flex h-screen items-center justify-center">
			<main className="w-full max-w-[600px] px-6">
				<div className="flex flex-col items-start gap-2">
					<div className="h-[65px] w-[110px]">
						<StarParticles />
					</div>
					<div>
						<span className="sr-only">
							{PREFIX}
							{SUFFIX}
						</span>
						<span
							aria-hidden="true"
							className="font-mono text-xl font-light text-[var(--color-text-muted)]"
						>
							{PREFIX}
							<span ref={ref}>{generateInitial(SUFFIX, 42)}</span>
						</span>
					</div>
				</div>
				<p className="mt-4 font-serif text-md leading-relaxed text-[var(--color-text-muted)]">
					{bioLines.map((line, i) => (
						<span key={i}>
							{i > 0 && <br />}
							{line}
						</span>
					))}
				</p>
				<div className="mt-6 flex items-center justify-between">
					<a
						href="https://github.com/0x1f320"
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono text-sm text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus:outline-none active:text-[var(--color-text)]"
					>
						{t("Home.github")}
					</a>
					<div className="flex items-center gap-3">
						<Link
							href="/"
							locale={altLocale}
							className="font-mono text-sm text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus:outline-none active:text-[var(--color-text)]"
						>
							{localeLabels[altLocale]}
						</Link>
						<ThemeToggle />
					</div>
				</div>
			</main>
		</div>
	);
}
