"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute float a_alpha;
attribute vec3 a_color;
uniform vec2 u_resolution;
varying float v_alpha;
varying vec3 v_color;

void main() {
  vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = 1.0;
  v_alpha = a_alpha;
  v_color = a_color;
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

const EDGE_PARTICLES = 900; // 윤곽선 근처
const FILL_PARTICLES = 300; // 내부 채움
const SCATTER_COUNT = 500; // 형태 밖 산개
const POINTS = 6;
const TAIL_STRETCH = 3.5;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

// 꼬리가 늘어난 별의 꼭짓점 생성
function generateStarVertices(
	cx: number,
	cy: number,
	outerR: number,
	innerR: number,
): [number, number][] {
	const verts: [number, number][] = [];
	// 시드 기반으로 꼭짓점마다 고정된 불규칙성 부여
	const jitterSeed = [
		0.12, -0.08, 0.15, -0.05, 0.09, -0.13, 0.07, -0.11, 0.14, -0.06,
		0.1, -0.09,
	];
	const angleSeed = [
		0.04, -0.03, 0.05, -0.02, 0.03, -0.04, 0.02, -0.05, 0.04, -0.03,
		0.03, -0.02,
	];
	for (let i = 0; i < POINTS * 2; i++) {
		const baseAngle = (Math.PI / POINTS) * i + Math.PI;
		const angle = baseAngle + angleSeed[i % angleSeed.length] * 0.5;
		const isOuter = i % 2 === 0;
		let r = isOuter ? outerR : innerR;
		// 꼬리
		if (i === POINTS) {
			r = outerR * TAIL_STRETCH;
		}
		// 꼬리 양옆 inner
		if (i === POINTS - 1 || i === POINTS + 1) {
			r = innerR * 1.3;
		}
		// 꼭짓점별 반지름 불규칙 (꼬리 제외)
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
	const angle =
		((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2));
	const dist = Math.sqrt(dx * dx + dy * dy);

	const n = verts.length;
	// 중심→각도 방향으로 다각형 외곽까지의 거리 계산
	for (let i = 0; i < n; i++) {
		const v0 = verts[i];
		const v1 = verts[(i + 1) % n];
		const a0 = Math.atan2(v0[1] - cy, v0[0] - cx);
		const a1 = Math.atan2(v1[1] - cy, v1[0] - cx);

		let start = ((a0 + Math.PI * 2) % (Math.PI * 2));
		let end = ((a1 + Math.PI * 2) % (Math.PI * 2));

		let contains = false;
		if (start <= end) {
			contains = angle >= start && angle <= end;
		} else {
			contains = angle >= start || angle <= end;
		}

		if (contains) {
			// 선분 v0→v1과 중심→angle 방향의 교점까지 거리
			const t0 = (v0[0] - cx) * Math.sin(angle) - (v0[1] - cy) * Math.cos(angle);
			const t1 = (v1[0] - cx) * Math.sin(angle) - (v1[1] - cy) * Math.cos(angle);
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

export function StarParticles() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl", {
			alpha: true,
			premultipliedAlpha: true,
		});
		if (!gl) return;

		const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		if (!vertShader || !fragShader) return;

		const program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
		gl.useProgram(program);

		const aPosition = gl.getAttribLocation(program, "a_position");
		const aAlpha = gl.getAttribLocation(program, "a_alpha");
		const aColor = gl.getAttribLocation(program, "a_color");
		const uResolution = gl.getUniformLocation(program, "u_resolution");

		const resize = () => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			gl.viewport(0, 0, canvas.width, canvas.height);
		};
		resize();
		window.addEventListener("resize", resize);

		const posBuffer = gl.createBuffer();
		const alphaBuffer = gl.createBuffer();
		const colorBuffer = gl.createBuffer();
		const totalCount = EDGE_PARTICLES + FILL_PARTICLES + SCATTER_COUNT;
		const positions = new Float32Array(totalCount * 2);
		const alphas = new Float32Array(totalCount);
		const colors = new Float32Array(totalCount * 3);
		// target color: rgb(200, 190, 180) = (0.784, 0.745, 0.706)
		const TARGET_R = 0.784, TARGET_G = 0.745, TARGET_B = 0.706;

		interface Particle {
			x: number;
			y: number;
			homeX: number;
			homeY: number;
			spawnX: number;
			spawnY: number;
			delay: number; // 0~1, staggered intro delay
			baseAlpha: number;

			phase: number;
			speed: number;
		}

		let particles: Particle[] = [];
		let prevW = 0;
		let prevH = 0;
		let introStartTime = -1;
		const INTRO_DURATION = 1.2; // seconds
		const INTRO_STAGGER = 0.4; // max delay spread in seconds

		// ease-out cubic
		const easeOut = (t: number) => 1 - (1 - t) ** 3;

		const randomSpawn = (homeX: number, homeY: number, w: number, h: number) => {
			const angle = Math.random() * Math.PI * 2;
			const dist = Math.max(w, h) * (0.6 + Math.random() * 0.6);
			return {
				spawnX: homeX + Math.cos(angle) * dist,
				spawnY: homeY + Math.sin(angle) * dist,
			};
		};

		const mouse = { x: -9999, y: -9999, active: false };
		const REPEL_RADIUS = 40;
		const REPEL_STRENGTH = 50;
		const RETURN_SPEED = 0.12;

		const onMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
			mouse.active = true;
		};
		const onMouseLeave = () => {
			mouse.active = false;
		};
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("mouseleave", onMouseLeave);

		let animId: number;

		const render = (time: number) => {
			const w = canvas.width;
			const h = canvas.height;

			// 꼬리가 오른쪽(+x)으로 뻗음
			// 왼쪽 끝: starCx - outerR, 오른쪽 끝: starCx + outerR * TAIL_STRETCH
			// 전체 중심: starCx + outerR * (TAIL_STRETCH - 1) / 2
			// 이걸 w/2에 맞추려면: starCx = w/2 - outerR * (TAIL_STRETCH - 1) / 2
			const outerR = 20;
			const starCx = w / 2 - (outerR * (TAIL_STRETCH - 1)) / 2;
			const starCy = h * 0.42;
			const innerR = outerR * 0.4;
			const maxR = outerR * TAIL_STRETCH;

			if (w !== prevW || h !== prevH) {
				const verts = generateStarVertices(starCx, starCy, outerR, innerR);
				particles = [];
				introStartTime = -1; // will be set on first frame

				const rotAngle = (-25 * Math.PI) / 180; // 25도
				const rotCos = Math.cos(rotAngle);
				const rotSin = Math.sin(rotAngle);
				const pivotX = w / 2;
				const pivotY = h / 2;

				// 윤곽선 파티클 — 외곽 근처에 집중 (reject sampling)
				for (let i = 0; i < EDGE_PARTICLES; i++) {
					// 형태 안에서 점을 뽑되, 중심에 가까운 건 버림 → 외곽에 집중
					let ox: number;
					let oy: number;
					for (;;) {
						[ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);
						const dx0 = ox - starCx;
						const dy0 = oy - starCy;
						const dist = Math.sqrt(dx0 * dx0 + dy0 * dy0);
						// 중심에서 먼 점일수록 accept 확률 높음
						if (Math.random() < (dist / maxR) ** 1.5) break;
					}

					const dx = ox - starCx;
					const isInTail = dx > outerR;
					const tailProgress = isInTail ? (dx - outerR) / (maxR - outerR) : 0;
					const fadeFactor = isInTail ? (1 - tailProgress) ** 2 : 1;

					const rx = ox - pivotX;
					const ry = oy - pivotY;
					const x = pivotX + rx * rotCos - ry * rotSin;
					const y = pivotY + rx * rotSin + ry * rotCos;

					const spawn1 = randomSpawn(x, y, w, h);
					particles.push({
						...spawn1,
						x: spawn1.spawnX,
						y: spawn1.spawnY,
						homeX: x,
						homeY: y,
						delay: Math.random(),
						baseAlpha: (0.12 + Math.random() * 0.4) * fadeFactor,

						phase: Math.random() * Math.PI * 2,
						speed: 0.3 + Math.random() * 1.5,
					});
				}

				// 내부 채움 파티클 — 희소하게
				for (let i = 0; i < FILL_PARTICLES; i++) {
					const [ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);

					const dx = ox - starCx;
					const isInTail = dx > outerR;
					const tailProgress = isInTail ? (dx - outerR) / (maxR - outerR) : 0;
					const fadeFactor = isInTail ? (1 - tailProgress) ** 2 : 1;

					const rx = ox - pivotX;
					const ry = oy - pivotY;
					const x = pivotX + rx * rotCos - ry * rotSin;
					const y = pivotY + rx * rotSin + ry * rotCos;

					const spawn2 = randomSpawn(x, y, w, h);
					particles.push({
						...spawn2,
						x: spawn2.spawnX,
						y: spawn2.spawnY,
						homeX: x,
						homeY: y,
						delay: Math.random(),
						baseAlpha: (0.06 + Math.random() * 0.2) * fadeFactor,

						phase: Math.random() * Math.PI * 2,
						speed: 0.2 + Math.random() * 1,
					});
				}

				// 산개 파티클 — 형태 밖으로 흩뿌리기
				for (let i = 0; i < SCATTER_COUNT; i++) {
					const [ox, oy] = randomPointInShape(starCx, starCy, verts, maxR);
					const angle = Math.random() * Math.PI * 2;
					const scatter = outerR * (0.1 + Math.random() * 0.5);
					const sx = ox + Math.cos(angle) * scatter;
					const sy = oy + Math.sin(angle) * scatter;

					const rx = sx - pivotX;
					const ry = sy - pivotY;
					const x = pivotX + rx * rotCos - ry * rotSin;
					const y = pivotY + rx * rotSin + ry * rotCos;

					const spawn3 = randomSpawn(x, y, w, h);
					particles.push({
						...spawn3,
						x: spawn3.spawnX,
						y: spawn3.spawnY,
						homeX: x,
						homeY: y,
						delay: Math.random(),
						baseAlpha: 0.1 + Math.random() * 0.3,

						phase: Math.random() * Math.PI * 2,
						speed: 0.2 + Math.random() * 1,
					});
				}

				prevW = w;
				prevH = h;
			}

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			const t = time * 0.001;
			if (introStartTime < 0) introStartTime = t;
			const introElapsed = t - introStartTime;
			const introDone = introElapsed >= INTRO_DURATION + INTRO_STAGGER;

			for (let i = 0; i < totalCount; i++) {
				const p = particles[i];

				if (!introDone) {
					// staggered intro: each particle starts at its own delay
					const particleTime = Math.max(0, introElapsed - p.delay * INTRO_STAGGER);
					const progress = Math.min(1, particleTime / INTRO_DURATION);
					const eased = easeOut(progress);
					p.x = p.spawnX + (p.homeX - p.spawnX) * eased;
					p.y = p.spawnY + (p.homeY - p.spawnY) * eased;
					// 가까워질수록 색을 찾음 (흰색 → 타겟 색)
					colors[i * 3] = 1.0 + (TARGET_R - 1.0) * eased;
					colors[i * 3 + 1] = 1.0 + (TARGET_G - 1.0) * eased;
					colors[i * 3 + 2] = 1.0 + (TARGET_B - 1.0) * eased;
				} else {
					if (mouse.active) {
						const dx = p.x - mouse.x;
						const dy = p.y - mouse.y;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < REPEL_RADIUS && dist > 0.1) {
							const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
							p.x += (dx / dist) * force * 0.06;
							p.y += (dy / dist) * force * 0.06;
						}
					}

					// 원래 위치로 복귀
					p.x += (p.homeX - p.x) * RETURN_SPEED;
					p.y += (p.homeY - p.y) * RETURN_SPEED;
				}

				if (introDone) {
					colors[i * 3] = TARGET_R;
					colors[i * 3 + 1] = TARGET_G;
					colors[i * 3 + 2] = TARGET_B;
				}

				positions[i * 2] = p.x;
				positions[i * 2 + 1] = p.y;
				const flicker = Math.sin(t * p.speed * 2.5 + p.phase);
				const baseFlicker = p.baseAlpha * (0.1 + 0.9 * flicker * flicker);

				if (!introDone) {
					const particleTime = Math.max(0, introElapsed - p.delay * INTRO_STAGGER);
					const progress = Math.min(1, particleTime / INTRO_DURATION);
					// 목표 위치에 아주 가까울 때만 알파가 올라감
					const alphaEased = easeOut(progress) ** 3;
					alphas[i] = baseFlicker * alphaEased;
				} else {
					alphas[i] = baseFlicker;
				}
			}

			gl.uniform2f(uResolution, w, h);

			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
			gl.enableVertexAttribArray(aPosition);
			gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
			gl.enableVertexAttribArray(aAlpha);
			gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
			gl.enableVertexAttribArray(aColor);
			gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

			gl.drawArrays(gl.POINTS, 0, totalCount);

			animId = requestAnimationFrame(render);
		};

		animId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener("resize", resize);
			canvas.removeEventListener("mousemove", onMouseMove);
			canvas.removeEventListener("mouseleave", onMouseLeave);
		};
	}, []);

	return <canvas ref={canvasRef} className="h-full w-full bg-transparent" />;
}
