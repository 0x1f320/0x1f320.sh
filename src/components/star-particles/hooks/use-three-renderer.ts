import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useThreeRenderer(
	containerRef: React.RefObject<HTMLDivElement | null>,
) {
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const w = container.clientWidth;
		const h = container.clientHeight;

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(0, w, 0, h, -1, 1);
		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			premultipliedAlpha: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(w, h);
		renderer.setClearColor(0x000000, 0);
		container.appendChild(renderer.domElement);
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";

		rendererRef.current = renderer;
		sceneRef.current = scene;
		cameraRef.current = camera;

		return () => {
			renderer.dispose();
			container.removeChild(renderer.domElement);
			rendererRef.current = null;
			sceneRef.current = null;
			cameraRef.current = null;
		};
	}, [containerRef]);

	return { rendererRef, sceneRef, cameraRef };
}
