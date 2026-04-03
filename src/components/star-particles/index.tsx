"use client";

import { type ReactElement, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { useMouse } from "@/hooks/use-mouse";
import { useResize } from "./hooks/use-resize";
import { useThreeRenderer } from "./hooks/use-three-renderer";
import { type ShapeMask, rasterizeShape } from "./rasterize-shape";

const FILL_PARTICLES = 1400;
const SCATTER_COUNT = 600;
const TOTAL_COUNT = FILL_PARTICLES + SCATTER_COUNT;

function getThemeColor(name: string, fallback: number): number {
	if (typeof document === "undefined") return fallback;
	const val = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	return val ? Number.parseFloat(val) : fallback;
}

function getParticleColors() {
	return {
		targetR: getThemeColor("--theme-particle-r", 0.784),
		targetG: getThemeColor("--theme-particle-g", 0.745),
		targetB: getThemeColor("--theme-particle-b", 0.706),
		startR: getThemeColor("--theme-particle-start-r", 1.0),
		startG: getThemeColor("--theme-particle-start-g", 1.0),
		startB: getThemeColor("--theme-particle-start-b", 1.0),
		alphaBoost: getThemeColor("--theme-particle-alpha-boost", 1.0),
		scatterAlpha: getThemeColor("--theme-particle-scatter-alpha", 1.0),
		pointSize: getThemeColor("--theme-particle-point-size", 1.0),
	};
}

const INTRO_DURATION = 1.2;
const INTRO_STAGGER = 0.4;

const REPEL_RADIUS = 40;
const REPEL_STRENGTH = 50;
const RETURN_SPEED = 0.12;

const VERTEX_SHADER = `
precision mediump float;
uniform float u_pointSize;
attribute float a_alpha;
attribute vec3 a_color;
varying float v_alpha;
varying vec3 v_color;

void main() {
  v_alpha = a_alpha;
  v_color = a_color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = u_pointSize;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform float u_cssPointSize;
varying float v_alpha;
varying vec3 v_color;

void main() {
  if (u_cssPointSize > 1.5) {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float edge = smoothstep(0.5, 0.15, dist);
    gl_FragColor = vec4(v_color, v_alpha * edge);
  } else {
    gl_FragColor = vec4(v_color, v_alpha);
  }
}
`;

interface ParticleData {
	x: number;
	y: number;
	homeX: number;
	homeY: number;
	spawnX: number;
	spawnY: number;
	delay: number;
	baseAlpha: number;
	phase: number;
	speed: number;
}

function randomSpawn(
	homeX: number,
	homeY: number,
	w: number,
	h: number,
): { spawnX: number; spawnY: number } {
	const angle = Math.random() * Math.PI * 2;
	const dist = Math.max(w, h) * (0.6 + Math.random() * 0.6);
	return {
		spawnX: homeX + Math.cos(angle) * dist,
		spawnY: homeY + Math.sin(angle) * dist,
	};
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

function shuffled<T>(arr: T[]): T[] {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function buildParticlesFromMask(
	mask: ShapeMask,
	w: number,
	h: number,
): ParticleData[] {
	if (mask.filled.length === 0) return [];

	const particles: ParticleData[] = [];
	const edgeSource = mask.edge.length > 0 ? mask.edge : mask.filled;

	// Shuffle pixel arrays for uniform cycling
	const fillPool = shuffled(mask.filled);
	const edgePool = shuffled(edgeSource);

	// Fit shape within container while maintaining aspect ratio
	const padding = 0.05;
	const availW = w * (1 - padding * 2);
	const availH = h * (1 - padding * 2);
	const containerAspect = availW / availH;

	let fitW: number;
	let fitH: number;
	if (mask.aspect > containerAspect) {
		fitW = availW;
		fitH = availW / mask.aspect;
	} else {
		fitH = availH;
		fitW = availH * mask.aspect;
	}

	const ox = (w - fitW) / 2;
	const oy = (h - fitH) / 2;

	const toWorld = (nx: number, ny: number): [number, number] => [
		ox + nx * fitW,
		oy + ny * fitH,
	];

	const JITTER = 0.008;

	// Fill particles — uniformly distributed across filled area
	for (let i = 0; i < FILL_PARTICLES; i++) {
		const src = fillPool[i % fillPool.length];
		const [hx, hy] = toWorld(
			src[0] + (Math.random() - 0.5) * JITTER,
			src[1] + (Math.random() - 0.5) * JITTER,
		);
		const spawn = randomSpawn(hx, hy, w, h);
		particles.push({
			...spawn,
			x: spawn.spawnX,
			y: spawn.spawnY,
			homeX: hx,
			homeY: hy,
			delay: Math.random(),
			baseAlpha: 0.18 + Math.random() * 0.42,
			phase: Math.random() * Math.PI * 2,
			speed: 0.2 + Math.random() * 1,
		});
	}

	// Scatter particles — cycled from shuffled edge pixels, offset outward
	for (let i = 0; i < SCATTER_COUNT; i++) {
		const src = edgePool[i % edgePool.length];
		const angle = Math.random() * Math.PI * 2;
		const scatter = 0.08 + Math.random() * 0.2;
		const [hx, hy] = toWorld(
			src[0] + Math.cos(angle) * scatter,
			src[1] + Math.sin(angle) * scatter,
		);
		const spawn = randomSpawn(hx, hy, w, h);
		particles.push({
			...spawn,
			x: spawn.spawnX,
			y: spawn.spawnY,
			homeX: hx,
			homeY: hy,
			delay: Math.random(),
			baseAlpha: 0.08 + Math.random() * 0.18,
			phase: Math.random() * Math.PI * 2,
			speed: 0.2 + Math.random() * 1,
		});
	}

	return particles;
}

interface StarParticlesProps {
	/** Shape to render as particles. Accepts an emoji string or a ReactElement that renders an SVG. */
	shape?: string | ReactElement;
}

export function StarParticles({ shape = "\u{1F320}" }: StarParticlesProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const shapeElRef = useRef<HTMLDivElement>(null);
	const { rendererRef, sceneRef, cameraRef } = useThreeRenderer(containerRef);

	const particlesRef = useRef<ParticleData[]>([]);
	const introStartRef = useRef(-1);
	const colorsRef = useRef(getParticleColors());
	const maskRef = useRef<ShapeMask | null>(null);
	const sizeRef = useRef({ w: 0, h: 0 });

	useEffect(() => {
		const observer = new MutationObserver(() => {
			colorsRef.current = getParticleColors();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const buffersRef = useRef<{
		geometry: THREE.BufferGeometry;
		posArray: Float32Array;
		alphaArray: Float32Array;
		colorArray: Float32Array;
		posAttr: THREE.BufferAttribute;
		alphaAttr: THREE.BufferAttribute;
		colorAttr: THREE.BufferAttribute;
		material: THREE.ShaderMaterial;
		points: THREE.Points;
	} | null>(null);

	useEffect(() => {
		const scene = sceneRef.current;
		if (!scene) return;

		const geometry = new THREE.BufferGeometry();
		const posArray = new Float32Array(TOTAL_COUNT * 3);
		const alphaArray = new Float32Array(TOTAL_COUNT);
		const colorArray = new Float32Array(TOTAL_COUNT * 3);

		const posAttr = new THREE.BufferAttribute(posArray, 3);
		posAttr.setUsage(THREE.DynamicDrawUsage);
		geometry.setAttribute("position", posAttr);

		const alphaAttr = new THREE.BufferAttribute(alphaArray, 1);
		alphaAttr.setUsage(THREE.DynamicDrawUsage);
		geometry.setAttribute("a_alpha", alphaAttr);

		const colorAttr = new THREE.BufferAttribute(colorArray, 3);
		colorAttr.setUsage(THREE.DynamicDrawUsage);
		geometry.setAttribute("a_color", colorAttr);

		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_pointSize: { value: colorsRef.current.pointSize },
				u_cssPointSize: { value: colorsRef.current.pointSize },
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: FRAGMENT_SHADER,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		buffersRef.current = {
			geometry,
			posArray,
			alphaArray,
			colorArray,
			posAttr,
			alphaAttr,
			colorAttr,
			material,
			points,
		};

		return () => {
			scene.remove(points);
			geometry.dispose();
			material.dispose();
			buffersRef.current = null;
		};
	}, [sceneRef]);

	const canvasRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		canvasRef.current = rendererRef.current?.domElement ?? null;
	}, [rendererRef]);

	const mouse = useMouse(canvasRef);

	const rebuildParticles = useCallback(() => {
		const mask = maskRef.current;
		const { w, h } = sizeRef.current;
		if (!mask || !w || !h) return;

		particlesRef.current = buildParticlesFromMask(mask, w, h);
		introStartRef.current = -1;

		const bufs = buffersRef.current;
		if (!bufs) return;
		const { startR, startG, startB } = colorsRef.current;
		const count = particlesRef.current.length;
		for (let i = 0; i < TOTAL_COUNT; i++) {
			if (i < count) {
				const p = particlesRef.current[i];
				bufs.posArray[i * 3] = p.x;
				bufs.posArray[i * 3 + 1] = p.y;
				bufs.posArray[i * 3 + 2] = 0;
				bufs.colorArray[i * 3] = startR;
				bufs.colorArray[i * 3 + 1] = startG;
				bufs.colorArray[i * 3 + 2] = startB;
			}
			bufs.alphaArray[i] = 0;
		}
	}, []);

	// Rasterize shape into pixel mask
	useEffect(() => {
		let cancelled = false;

		let source: string;
		if (typeof shape === "string") {
			source = shape;
		} else {
			// ReactElement: read rendered SVG from hidden container
			const el = shapeElRef.current;
			const svg = el?.querySelector("svg");
			if (!svg) return;
			source = new XMLSerializer().serializeToString(svg);
		}

		rasterizeShape(source).then((mask) => {
			if (cancelled) return;
			maskRef.current = mask;
			rebuildParticles();
		});
		return () => {
			cancelled = true;
		};
	}, [shape, rebuildParticles]);

	const handleResize = useCallback(
		(w: number, h: number) => {
			sizeRef.current = { w, h };
			rebuildParticles();
		},
		[rebuildParticles],
	);

	useResize(containerRef, rendererRef, cameraRef, handleResize);

	const renderRef = useRef((time: number) => {
		const renderer = rendererRef.current;
		const scene = sceneRef.current;
		const camera = cameraRef.current;
		const bufs = buffersRef.current;
		const particles = particlesRef.current;
		if (!renderer || !scene || !camera || !bufs || particles.length === 0)
			return;

		const cssSize = colorsRef.current.pointSize;
		bufs.material.uniforms.u_pointSize.value =
			cssSize * renderer.getPixelRatio();
		bufs.material.uniforms.u_cssPointSize.value = cssSize;

		const { posArray, alphaArray, colorArray, posAttr, alphaAttr, colorAttr } =
			bufs;

		const t = time * 0.001;
		if (introStartRef.current < 0) introStartRef.current = t;
		const introElapsed = t - introStartRef.current;
		const introDone = introElapsed >= INTRO_DURATION + INTRO_STAGGER;
		const m = mouse.current;
		const {
			targetR,
			targetG,
			targetB,
			startR,
			startG,
			startB,
			alphaBoost,
			scatterAlpha,
		} = colorsRef.current;
		const scatterStart = FILL_PARTICLES;
		const count = particles.length;

		for (let i = 0; i < count; i++) {
			const p = particles[i];

			if (!introDone) {
				const particleTime = Math.max(
					0,
					introElapsed - p.delay * INTRO_STAGGER,
				);
				const progress = Math.min(1, particleTime / INTRO_DURATION);
				const eased = easeOut(progress);
				p.x = p.spawnX + (p.homeX - p.spawnX) * eased;
				p.y = p.spawnY + (p.homeY - p.spawnY) * eased;
				colorArray[i * 3] = startR + (targetR - startR) * eased;
				colorArray[i * 3 + 1] = startG + (targetG - startG) * eased;
				colorArray[i * 3 + 2] = startB + (targetB - startB) * eased;
			} else {
				if (m.active) {
					const dx = p.x - m.x;
					const dy = p.y - m.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < REPEL_RADIUS && dist > 0.1) {
						const force =
							((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
						p.x += (dx / dist) * force * 0.06;
						p.y += (dy / dist) * force * 0.06;
					}
				}
				p.x += (p.homeX - p.x) * RETURN_SPEED;
				p.y += (p.homeY - p.y) * RETURN_SPEED;
				colorArray[i * 3] = targetR;
				colorArray[i * 3 + 1] = targetG;
				colorArray[i * 3 + 2] = targetB;
			}

			posArray[i * 3] = p.x;
			posArray[i * 3 + 1] = p.y;

			const flicker = Math.sin(t * p.speed * 2.5 + p.phase);
			const scatter = i >= scatterStart ? scatterAlpha : 1;
			const baseFlicker =
				Math.min(1, p.baseAlpha * alphaBoost * scatter) *
				(0.1 + 0.9 * flicker * flicker);

			if (!introDone) {
				const particleTime = Math.max(
					0,
					introElapsed - p.delay * INTRO_STAGGER,
				);
				const progress = Math.min(1, particleTime / INTRO_DURATION);
				const alphaEased = easeOut(progress) ** 3;
				alphaArray[i] = baseFlicker * alphaEased;
			} else {
				alphaArray[i] = baseFlicker;
			}
		}

		posAttr.needsUpdate = true;
		alphaAttr.needsUpdate = true;
		colorAttr.needsUpdate = true;

		renderer.render(scene, camera);
	});

	useAnimationFrame(renderRef);

	return (
		<>
			{typeof shape !== "string" && (
				<div
					ref={shapeElRef}
					aria-hidden
					className="pointer-events-none absolute h-0 w-0 overflow-hidden"
				>
					{shape}
				</div>
			)}
			<div ref={containerRef} className="h-full w-full bg-transparent" />
		</>
	);
}
