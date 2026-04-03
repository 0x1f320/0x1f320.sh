"use client";

import { useTranslations } from "next-intl";
import { StarParticles } from "@/components/star-particles";
import { generateInitial, useScrambleText } from "@/hooks/use-scramble-text";

const PREFIX = "0x";
const SUFFIX = "1F320";

export function HomeContent() {
	const t = useTranslations();
	const ref = useScrambleText(SUFFIX);

	const bio = t.rich("Home.bio", {
		underline: (chunks) => (
			<span className="animate-underline-slide">{chunks}</span>
		),
		underline2: (chunks) => (
			<span className="animate-underline-slide animation-delay-500">{chunks}</span>
		),
		br: () => <br />,
	});
	return (
		<>
			<div className="mb-4 h-[65px] w-[110px]">
				<StarParticles />
			</div>
			<div>
				<span className="sr-only">{PREFIX}{SUFFIX}</span>
				<span
					aria-hidden="true"
					className="font-mono text-xl font-light text-[var(--color-text-muted)]"
				>
					{PREFIX}
					<span ref={ref}>{generateInitial(SUFFIX, 42)}</span>
				</span>
			</div>
			<p className="mt-4 font-serif text-md leading-relaxed text-[var(--color-text-muted)]">
				{bio}
			</p>
		</>
	);
}
