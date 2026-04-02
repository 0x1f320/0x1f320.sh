import { useCallback, useEffect, useRef } from "react";

export function useMouse(elementRef: React.RefObject<HTMLElement | null>) {
	const mouse = useRef({ x: -9999, y: -9999, active: false });

	const onMouseMove = useCallback(
		(e: MouseEvent) => {
			const el = elementRef.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			mouse.current.x = e.clientX - rect.left;
			mouse.current.y = e.clientY - rect.top;
			mouse.current.active = true;
		},
		[elementRef],
	);

	const onMouseLeave = useCallback(() => {
		mouse.current.active = false;
	}, []);

	useEffect(() => {
		const el = elementRef.current;
		if (!el) return;
		el.addEventListener("mousemove", onMouseMove);
		el.addEventListener("mouseleave", onMouseLeave);
		return () => {
			el.removeEventListener("mousemove", onMouseMove);
			el.removeEventListener("mouseleave", onMouseLeave);
		};
	}, [elementRef, onMouseMove, onMouseLeave]);

	return mouse;
}
