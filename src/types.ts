export type BlockType = "free" | "fragmented" | "contiguous" | "unmovable";
export type BlockGrid = BlockType[];

export const BLOCK_COUNT = 290;
export const BLOCK_WIDTH = 2;
export const BAR_HEIGHT = 30;

export const BLOCK_COLORS: Record<BlockType, string> = {
	free: "#FFFFFF",
	fragmented: "#E00000",
	contiguous: "#0000C0",
	unmovable: "#00C000",
};
