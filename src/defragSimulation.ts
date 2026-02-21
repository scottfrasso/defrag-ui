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

		// Find next data block after the free slot
		let dataIdx = -1;
		for (let i = freeIdx + 1; i < g.length; i++) {
			if (g[i] === "fragmented" || g[i] === "contiguous") {
				dataIdx = i;
				break;
			}
		}
		if (dataIdx === -1) break;

		// Swap — moved block becomes contiguous (blue)
		g[freeIdx] = "contiguous";
		g[dataIdx] = "free";

		yield [...g];
	}
}
