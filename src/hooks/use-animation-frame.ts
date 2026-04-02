import { useEffect } from "react";

export function useAnimationFrame(
	callback: React.RefObject<(time: number) => void>,
) {
	useEffect(() => {
		let animId: number;
		const loop = (time: number) => {
			callback.current(time);
			animId = requestAnimationFrame(loop);
		};
		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, [callback]);
}
