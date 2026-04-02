"use client";

import { StarParticles } from "@/components/star-particles";
import { generateInitial, useScrambleText } from "@/hooks/use-scramble-text";

const PREFIX = "0x";
const SUFFIX = "1F320";

export default function Home() {
	const ref = useScrambleText(SUFFIX);

	return (
		<div className="flex h-screen items-center justify-center">
			<main className="w-full max-w-[560px] px-6">
				<div className="flex flex-col items-start gap-2">
					<div className="h-[65px] w-[110px]">
						<StarParticles />
					</div>
					<div>
						<span className="sr-only">{PREFIX}{SUFFIX}</span>
						<span aria-hidden="true" className="font-mono text-xl font-light text-zinc-400">
							{PREFIX}
							<span ref={ref}>{generateInitial(SUFFIX, 42)}</span>
						</span>
					</div>
				</div>
				<p className="mt-4 font-serif text-md leading-relaxed text-zinc-400">
					안녕하세요. 한국에 거주하는 5년차 소프트웨어 엔지니어입니다.
					<br />
					문제를 해결하고, 고객 경험에 기여합니다.
				</p>
				<a
					href="https://github.com/0x1f320"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-6 inline-block font-mono text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:text-zinc-300 focus:outline-none active:text-zinc-300"
				>
					GitHub
				</a>
			</main>
		</div>
	);
}
