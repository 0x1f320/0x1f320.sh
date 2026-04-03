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
				<StarParticles
					shape={
						<svg viewBox="-5 -10 95 75">
							<defs>
								<mask id="star-knockout">
									<rect x="-5" y="-10" width="95" height="75" fill="white" />
									<path
										fill="black"
										stroke="black"
										strokeWidth="10"
										strokeLinejoin="round"
										transform="translate(10, -8) scale(0.75)"
										d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L68,8 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
									/>
								</mask>
							</defs>
							{/* Big star with knockout mask */}
							<path
								fill="currentColor"
								mask="url(#star-knockout)"
								d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L78,3 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
							/>
							{/* Small star */}
							<path
								fill="currentColor"
								transform="translate(10, -8) scale(0.75)"
								d="M2.00,39.41 L15.15,29.82 L3.98,16.69 L19.21,23.50 L24.71,8.67 L27.53,22.84 L68,8 L31.72,30.93 L40.90,43.80 L25.77,37.12 L20.24,52.24 L18.37,36.36Z"
							/>
						</svg>
					}
				/>
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
