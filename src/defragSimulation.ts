import type { BlockGrid } from "./types";

/**
 * Generator that advances a defrag simulation one block-move per step.
 * Algorithm: scan left-to-right for the first free slot, find the next
 * data block after it, swap them (marking the moved block as contiguous).
 * Unmovable (green) blocks are never touched.
 */
export function* defragStepper(
	grid: BlockGrid,
): Generator<BlockGrid, void, undefined> {
	const g = [...grid];

	for (;;) {
		// Find first free slot
		let freeIdx = -1;
		for (let i = 0; i < g.length; i++) {
			if (g[i] === "free") {
				freeIdx = i;
				break;
			}
		}
		if (freeIdx === -1) break;

		// Collect fragmented (red) block indices after the free slot and pick one at random
		const fragIndices: number[] = [];
		for (let i = freeIdx + 1; i < g.length; i++) {
			if (g[i] === "fragmented") fragIndices.push(i);
		}
		if (fragIndices.length === 0) break;
		const dataIdx = fragIndices[Math.floor(Math.random() * fragIndices.length)];

		// Swap — moved block becomes contiguous (blue)
		g[freeIdx] = "contiguous";
		g[dataIdx] = "free";

		yield [...g];
	}
}
