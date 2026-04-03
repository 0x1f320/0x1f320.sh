export interface ShapeMask {
	/** Normalized [0-1] coordinates of all filled pixels */
	filled: [number, number][];
	/** Normalized [0-1] coordinates of edge pixels (filled with at least one empty neighbor) */
	edge: [number, number][];
	/** Aspect ratio (width / height) of the shape's bounding box */
	aspect: number;
}

const RESOLUTION = 80;
const ALPHA_THRESHOLD = 30;

function isSvgString(s: string): boolean {
	return s.trimStart().startsWith("<");
}

function extractMask(ctx: CanvasRenderingContext2D): ShapeMask {
	const w = ctx.canvas.width;
	const h = ctx.canvas.height;
	const { data } = ctx.getImageData(0, 0, w, h);

	// Find bounding box of non-transparent pixels
	let minX = w;
	let minY = h;
	let maxX = 0;
	let maxY = 0;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD) {
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
			}
		}
	}

	if (maxX < minX) return { filled: [], edge: [], aspect: 1 };

	const bw = maxX - minX + 1;
	const bh = maxY - minY + 1;

	const isFilled = (x: number, y: number): boolean => {
		if (x < 0 || x >= w || y < 0 || y >= h) return false;
		return data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD;
	};

	const filled: [number, number][] = [];
	const edge: [number, number][] = [];

	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			if (!isFilled(x, y)) continue;

			const nx = (x - minX + 0.5) / bw;
			const ny = (y - minY + 0.5) / bh;

			filled.push([nx, ny]);

			if (
				!isFilled(x - 1, y) ||
				!isFilled(x + 1, y) ||
				!isFilled(x, y - 1) ||
				!isFilled(x, y + 1)
			) {
				edge.push([nx, ny]);
			}
		}
	}

	return { filled, edge, aspect: bw / bh };
}

export function rasterizeShape(shape: string): Promise<ShapeMask> {
	const canvas = document.createElement("canvas");
	canvas.width = RESOLUTION;
	canvas.height = RESOLUTION;
	const ctx = canvas.getContext("2d")!;

	if (isSvgString(shape)) {
		return new Promise((resolve, reject) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(shape, "image/svg+xml");
			const svg = doc.documentElement;
			if (!svg.getAttribute("xmlns")) {
				svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			}
			svg.setAttribute("width", String(RESOLUTION));
			svg.setAttribute("height", String(RESOLUTION));
			const serialized = new XMLSerializer().serializeToString(svg);
			const blob = new Blob([serialized], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const img = new Image();
			img.onload = () => {
				ctx.drawImage(img, 0, 0, RESOLUTION, RESOLUTION);
				URL.revokeObjectURL(url);
				resolve(extractMask(ctx));
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error("Failed to load SVG shape"));
			};
			img.src = url;
		});
	}

	// Emoji / text rendering
	const fontSize = RESOLUTION * 0.8;
	ctx.font = `${fontSize}px serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(shape, RESOLUTION / 2, RESOLUTION / 2);
	return Promise.resolve(extractMask(ctx));
}
