"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { useMouse } from "@/hooks/use-mouse";
import { useResize } from "./hooks/use-resize";
import { useThreeRenderer } from "./hooks/use-three-renderer";

const EDGE_PARTICLES = 900;
const FILL_PARTICLES = 300;
const SCATTER_COUNT = 500;
const TOTAL_COUNT = EDGE_PARTICLES + FILL_PARTICLES + SCATTER_COUNT;
const POINTS = 6;
const TAIL_STRETCH = 3.5;

const TARGET_R = 0.784;
const TARGET_G = 0.745;
const TARGET_B = 0.706;

const INTRO_DURATION = 1.2;
const INTRO_STAGGER = 0.4;

const REPEL_RADIUS = 40;
const REPEL_STRENGTH = 50;
const RETURN_SPEED = 0.12;

const VERTEX_SHADER = `
attribute float a_alpha;
attribute vec3 a_color;
varying float v_alpha;
varying vec3 v_color;

void main() {
  v_alpha = a_alpha;
  v_color = a_color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 1.0;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_alpha;
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, v_alpha);
}
`;

function generateStarVertices(
	cx: number,
	cy: number,
	outerR: number,
	innerR: number,
): [number, number][] {
	const verts: [number, number][] = [];
	const jitterSeed = [
		0.12, -0.08, 0.15, -0.05, 0.09, -0.13, 0.07, -0.11, 0.14, -0.06, 0.1,
		-0.09,
	];
	const angleSeed = [
		0.04, -0.03, 0.05, -0.02, 0.03, -0.04, 0.02, -0.05, 0.04, -0.03, 0.03,
		-0.02,
	];
	for (let i = 0; i < POINTS * 2; i++) {
		const baseAngle = (Math.PI / POINTS) * i + Math.PI;
		const angle = baseAngle + angleSeed[i % angleSeed.length] * 0.5;
		const isOuter = i % 2 === 0;
		let r = isOuter ? outerR : innerR;
		if (i === POINTS) {
			r = outerR * TAIL_STRETCH;
		}
		if (i === POINTS - 1 || i === POINTS + 1) {
			r = innerR * 1.3;
		}
		if (i !== POINTS) {
			r *= 1 + jitterSeed[i % jitterSeed.length];
		}
		verts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
	}
	return verts;
}

function isInsidePolygon(
	x: number,
	y: number,
	cx: number,
	cy: number,
	verts: [number, number][],
) {
	const dx = x - cx;
	const dy = y - cy;
	const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
	const dist = Math.sqrt(dx * dx + dy * dy);

	const n = verts.length;
	for (let i = 0; i < n; i++) {
		const v0 = verts[i];
		const v1 = verts[(i + 1) % n];
		const a0 = Math.atan2(v0[1] - cy, v0[0] - cx);
		const a1 = Math.atan2(v1[1] - cy, v1[0] - cx);

		let start = (a0 + Math.PI * 2) % (Math.PI * 2);
		let end = (a1 + Math.PI * 2) % (Math.PI * 2);

		let contains = false;
		if (start <= end) {
			contains = angle >= start && angle <= end;
		} else {
			contains = angle >= start || angle <= end;
		}

		if (contains) {
			const t0 =
				(v0[0] - cx) * Math.sin(angle) - (v0[1] - cy) * Math.cos(angle);
			const t1 =
				(v1[0] - cx) * Math.sin(angle) - (v1[1] - cy) * Math.cos(angle);
			if (Math.abs(t0 - t1) < 0.001) continue;
			const frac = t0 / (t0 - t1);
			const ix = v0[0] + (v1[0] - v0[0]) * frac;
			const iy = v0[1] + (v1[1] - v0[1]) * frac;
			const maxDist = Math.sqrt((ix - cx) ** 2 + (iy - cy) ** 2);
			return dist <= maxDist;
		}
	}
	return false;
}

function randomPointInShape(
	cx: number,
	cy: number,
	verts: [number, number][],
	maxR: number,
): [number, number] {
	for (;;) {
		const x = cx + (Math.random() - 0.5) * maxR * 2;
		const y = cy + (Math.random() - 0.5) * maxR * 2;
		if (isInsidePolygon(x, y, cx, cy, verts)) {
			const dx = x - cx;
			const dy = y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const scatter = (dist / maxR) * maxR * 0.06;
			return [
				x + (Math.random() - 0.5) * scatter,
				y + (Math.random() - 0.5) * scatter,
			];
		}
	}
}

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

function buildParticles(w: number, h: number): ParticleData[] {
	const outerR = 20;
	const starCx = w / 2 - (outerR * (TAIL_STRETCH - 1)) / 2;
	const starCy = h * 0.42;
	const innerR = outerR * 0.4;
	const maxR = outerR * TAIL_STRETCH;

	const verts = generateStarVertices(starCx, starCy, outerR, innerR);
	const particles: ParticleData[] = [];

	const rotAngle = (-25 * Math.PI) / 180;
	const rotCos = Math.cos(rotAngle);
	const rotSin = Math.sin(rotAngle);
	const pivotX = w / 2;
	const pivotY = h / 2;

	const rotate = (ox: number, oy: number) => {
		const rx = ox - pivotX;
		const ry = oy - pivotY;
		return {
			x: pivotX + rx * rotCos - ry * rotSin,
			y: pivotY + rx * rotSin + ry * rotCos,
		};
	};

	for (let i = 0; i < EDGE_PARTICLES; i++) {
		let ox: number;
		let oy: number;
		for (;;) {
			[ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);
			const dx0 = ox - starCx;
			const dy0 = oy - starCy;
			const dist = Math.sqrt(dx0 * dx0 + dy0 * dy0);
			if (Math.random() < (dist / maxR) ** 1.5) break;
		}

		const dx = ox - starCx;
		const isInTail = dx > outerR;
		const tailProgress = isInTail ? (dx - outerR) / (maxR - outerR) : 0;
		const fadeFactor = isInTail ? (1 - tailProgress) ** 2 : 1;

		const { x, y } = rotate(ox, oy);
		const spawn = randomSpawn(x, y, w, h);
		particles.push({
			...spawn,
			x: spawn.spawnX,
			y: spawn.spawnY,
			homeX: x,
			homeY: y,
			delay: Math.random(),
			baseAlpha: (0.12 + Math.random() * 0.4) * fadeFactor,
			phase: Math.random() * Math.PI * 2,
			speed: 0.3 + Math.random() * 1.5,
		});
	}

	for (let i = 0; i < FILL_PARTICLES; i++) {
		const [ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);

		const dx = ox - starCx;
		const isInTail = dx > outerR;
		const tailProgress = isInTail ? (dx - outerR) / (maxR - outerR) : 0;
		const fadeFactor = isInTail ? (1 - tailProgress) ** 2 : 1;

		const { x, y } = rotate(ox, oy);
		const spawn = randomSpawn(x, y, w, h);
		particles.push({
			...spawn,
			x: spawn.spawnX,
			y: spawn.spawnY,
			homeX: x,
			homeY: y,
			delay: Math.random(),
			baseAlpha: (0.06 + Math.random() * 0.2) * fadeFactor,
			phase: Math.random() * Math.PI * 2,
			speed: 0.2 + Math.random() * 1,
		});
	}

	for (let i = 0; i < SCATTER_COUNT; i++) {
		const [ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);
		const angle = Math.random() * Math.PI * 2;
		const scatter = outerR * (0.1 + Math.random() * 0.5);
		const sx = ox + Math.cos(angle) * scatter;
		const sy = oy + Math.sin(angle) * scatter;

		const { x, y } = rotate(sx, sy);
		const spawn = randomSpawn(x, y, w, h);
		particles.push({
			...spawn,
			x: spawn.spawnX,
			y: spawn.spawnY,
			homeX: x,
			homeY: y,
			delay: Math.random(),
			baseAlpha: 0.1 + Math.random() * 0.3,
			phase: Math.random() * Math.PI * 2,
			speed: 0.2 + Math.random() * 1,
		});
	}

	return particles;
}

export function StarParticles() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { rendererRef, sceneRef, cameraRef } = useThreeRenderer(containerRef);

	const particlesRef = useRef<ParticleData[]>([]);
	const introStartRef = useRef(-1);
	const buffersRef = useRef<{
		geometry: THREE.BufferGeometry;
		posArray: Float32Array;
		alphaArray: Float32Array;
		colorArray: Float32Array;
		posAttr: THREE.BufferAttribute;
		alphaAttr: THREE.BufferAttribute;
		colorAttr: THREE.BufferAttribute;
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

	const handleResize = useCallback((w: number, h: number) => {
		particlesRef.current = buildParticles(w, h);
		introStartRef.current = -1;

		const bufs = buffersRef.current;
		if (!bufs) return;
		for (let i = 0; i < TOTAL_COUNT; i++) {
			const p = particlesRef.current[i];
			bufs.posArray[i * 3] = p.x;
			bufs.posArray[i * 3 + 1] = p.y;
			bufs.posArray[i * 3 + 2] = 0;
			bufs.colorArray[i * 3] = 1.0;
			bufs.colorArray[i * 3 + 1] = 1.0;
			bufs.colorArray[i * 3 + 2] = 1.0;
			bufs.alphaArray[i] = 0;
		}
	}, []);

	useResize(containerRef, rendererRef, cameraRef, handleResize);

	const renderRef = useRef((time: number) => {
		const renderer = rendererRef.current;
		const scene = sceneRef.current;
		const camera = cameraRef.current;
		const bufs = buffersRef.current;
		const particles = particlesRef.current;
		if (!renderer || !scene || !camera || !bufs || particles.length === 0)
			return;

		const { posArray, alphaArray, colorArray, posAttr, alphaAttr, colorAttr } =
			bufs;

		const t = time * 0.001;
		if (introStartRef.current < 0) introStartRef.current = t;
		const introElapsed = t - introStartRef.current;
		const introDone = introElapsed >= INTRO_DURATION + INTRO_STAGGER;
		const m = mouse.current;

		for (let i = 0; i < TOTAL_COUNT; i++) {
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
				colorArray[i * 3] = 1.0 + (TARGET_R - 1.0) * eased;
				colorArray[i * 3 + 1] = 1.0 + (TARGET_G - 1.0) * eased;
				colorArray[i * 3 + 2] = 1.0 + (TARGET_B - 1.0) * eased;
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
				colorArray[i * 3] = TARGET_R;
				colorArray[i * 3 + 1] = TARGET_G;
				colorArray[i * 3 + 2] = TARGET_B;
			}

			posArray[i * 3] = p.x;
			posArray[i * 3 + 1] = p.y;

			const flicker = Math.sin(t * p.speed * 2.5 + p.phase);
			const baseFlicker = p.baseAlpha * (0.1 + 0.9 * flicker * flicker);

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

	return <div ref={containerRef} className="h-full w-full bg-transparent" />;
}
