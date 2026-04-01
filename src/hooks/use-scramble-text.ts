import { type RefObject, useEffect, useRef } from "react";

const CHARS = "%^!$@&*#~?><";

interface UseScrambleTextOptions {
	duration?: number;
	interval?: number;
	seed?: number;
}

function seededRandom(seed: number) {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

export function generateInitial(target: string, seed: number) {
	const rng = seededRandom(seed);
	return target
		.split("")
		.map(() => CHARS[Math.floor(rng() * CHARS.length)])
		.join("");
}

export function useScrambleText(
	target: string,
	{ duration = 700, interval = 50, seed = 42 }: UseScrambleTextOptions = {},
): RefObject<HTMLElement | null> {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const steps = duration / interval;
		let step = 0;

		el.textContent = generateInitial(target, seed);

		const timer = setInterval(() => {
			step++;
			const resolved = Math.floor((step / steps) * target.length);

			el.textContent = target
				.split("")
				.map((char, i) =>
					i < resolved
						? char
						: CHARS[Math.floor(Math.random() * CHARS.length)],
				)
				.join("");

			if (step >= steps) {
				el.textContent = target;
				clearInterval(timer);
			}
		}, interval);

		return () => clearInterval(timer);
	}, [target, duration, interval, seed]);

	return ref;
}
