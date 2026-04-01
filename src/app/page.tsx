"use client";

import { StarParticles } from "@/components/star-particles";
import { generateInitial, useScrambleText } from "@/hooks/use-scramble-text";

const PREFIX = "0x";
const SUFFIX = "1F320";

export default function Home() {
	const ref = useScrambleText(SUFFIX);

	return (
		<div className="flex h-screen items-center justify-center">
			<main className="w-full max-w-[480px] px-6">
				<div className="flex flex-col items-start gap-2">
					<div className="h-[65px] w-[110px]">
						<StarParticles />
					</div>
					<div>
						<span className="sr-only">{PREFIX}{SUFFIX}</span>
						<span aria-hidden="true" className="font-mono text-2xl font-light text-zinc-400">
							{PREFIX}
							<span ref={ref}>{generateInitial(SUFFIX, 42)}</span>
						</span>
					</div>
				</div>
			</main>
		</div>
	);
}
