import { BLOCK_COUNT, type BlockGrid, type BlockType } from "./types";

export function generateGrid(): BlockGrid {
	const grid: BlockGrid = new Array<BlockType>(BLOCK_COUNT).fill("free");

	// Place unmovable blocks (green) — one cluster in the middle area
	const greenStart = 90 + Math.floor(Math.random() * 50);
	const greenLen = 12 + Math.floor(Math.random() * 10);
	for (
		let i = greenStart;
		i < Math.min(greenStart + greenLen, BLOCK_COUNT);
		i++
	) {
		grid[i] = "unmovable";
	}

	// Walk through the grid placing data clusters and free gaps.
	// Data density decreases toward the right to mimic a partially-full disk.
	let pos = 0;
	while (pos < BLOCK_COUNT) {
		if (grid[pos] === "unmovable") {
			pos++;
			continue;
		}

		const dataProb = pos < 80 ? 0.75 : pos < 180 ? 0.45 : 0.2;

		if (Math.random() < dataProb) {
			const type: BlockType =
				Math.random() < 0.75 ? "fragmented" : "contiguous";
			const clusterLen =
				type === "contiguous"
					? 1 + Math.floor(Math.random() * 5)
					: 1 + Math.floor(Math.random() * 3);

			for (let j = 0; j < clusterLen && pos + j < BLOCK_COUNT; j++) {
				if (grid[pos + j] === "unmovable") break;
				grid[pos + j] = type;
			}
			pos += clusterLen;
		} else {
			const gapLen = 1 + Math.floor(Math.random() * (pos < 100 ? 5 : 15));
			pos += gapLen;
		}
	}

	return grid;
}
