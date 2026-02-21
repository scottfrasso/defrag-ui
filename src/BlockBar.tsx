import { BAR_HEIGHT, BLOCK_COLORS, BLOCK_WIDTH, type BlockGrid } from "./types";

/** Renders a BlockGrid as run-length-encoded SVG rects. */
export default function BlockBar({ grid }: { grid: BlockGrid }) {
	const rects: { x: number; width: number; fill: string }[] = [];

	let i = 0;
	while (i < grid.length) {
		const type = grid[i];
		let runLen = 1;
		while (i + runLen < grid.length && grid[i + runLen] === type) {
			runLen++;
		}
		rects.push({
			x: i * BLOCK_WIDTH,
			width: runLen * BLOCK_WIDTH,
			fill: BLOCK_COLORS[type],
		});
		i += runLen;
	}

	return (
		<g>
			{rects.map((r) => (
				<rect
					key={`${r.x}`}
					x={r.x}
					y={0}
					width={r.width}
					height={BAR_HEIGHT}
					fill={r.fill}
					shapeRendering="crispEdges"
				/>
			))}
		</g>
	);
}
