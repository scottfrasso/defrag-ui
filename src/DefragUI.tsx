import BlockBar from "./BlockBar";
import SvgChrome from "./SvgChrome";
import { useDefragRunner } from "./useDefragRunner";

export default function DefragUI() {
	const { initialGrid, currentGrid, isRunning, start, stop } =
		useDefragRunner();

	return (
		// biome-ignore lint/a11y/useSemanticElements: full-screen click target
		<div
			className="defrag-container"
			onClick={() => {
				if (!isRunning) start();
			}}
			onKeyDown={(e) => {
				if ((e.key === "Enter" || e.key === " ") && !isRunning) start();
			}}
			role="button"
			tabIndex={0}
		>
			<div className="svg-wrapper">
				<SvgChrome
					topBarContent={<BlockBar grid={initialGrid} />}
					bottomBarContent={<BlockBar grid={currentGrid ?? initialGrid} />}
				/>
			</div>
			{!isRunning && (
				<div className="click-prompt">
					Click anywhere to start defragmenting
				</div>
			)}
			{isRunning && (
				<button
					type="button"
					className="stop-btn"
					onClick={(e) => {
						e.stopPropagation();
						stop();
					}}
				>
					Stop
				</button>
			)}
		</div>
	);
}
