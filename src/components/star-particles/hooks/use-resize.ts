import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

export function useResize(
	containerRef: React.RefObject<HTMLDivElement | null>,
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
	cameraRef: React.RefObject<THREE.OrthographicCamera | null>,
	onResize: (w: number, h: number) => void,
) {
	const prevSize = useRef({ w: 0, h: 0 });

	const handleResize = useCallback(() => {
		const container = containerRef.current;
		const renderer = rendererRef.current;
		const camera = cameraRef.current;
		if (!container || !renderer || !camera) return;

		const newW = container.clientWidth;
		const newH = container.clientHeight;
		if (newW === prevSize.current.w && newH === prevSize.current.h) return;

		renderer.setSize(newW, newH);
		camera.right = newW;
		camera.bottom = newH;
		camera.updateProjectionMatrix();
		prevSize.current = { w: newW, h: newH };
		onResize(newW, newH);
	}, [containerRef, rendererRef, cameraRef, onResize]);

	useEffect(() => {
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [handleResize]);
}
