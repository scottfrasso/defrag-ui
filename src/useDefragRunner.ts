import { useCallback, useEffect, useRef, useState } from "react";
import { defragStepper } from "./defragSimulation";
import { generateGrid } from "./generateGrid";
import {
	playComplete,
	playDefragBurst,
	resumeAudio,
	startSpindle,
	stopSpindle,
} from "./sound";
import type { BlockGrid } from "./types";

export function useDefragRunner() {
	const [initialGrid, setInitialGrid] = useState<BlockGrid>(generateGrid);
	const [currentGrid, setCurrentGrid] = useState<BlockGrid | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	const stepperRef = useRef<Generator<BlockGrid, void, undefined> | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tickRef = useRef<(() => void) | null>(null);

	const stop = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		stopSpindle();
		setIsRunning(false);
		stepperRef.current = null;
	}, []);

	// Tick function stored in a ref to avoid recursive useCallback dep issues
	tickRef.current = () => {
		const stepper = stepperRef.current;
		if (!stepper) return;

		const result = stepper.next();
		if (result.done) {
			playComplete();
			stop();
			return;
		}

		setCurrentGrid(result.value);
		playDefragBurst();

		const delay = 500 + Math.random() * 1000;
		timerRef.current = setTimeout(() => tickRef.current?.(), delay);
	};

	const start = useCallback(() => {
		resumeAudio();
		stop();

		const grid = generateGrid();
		setInitialGrid(grid);
		setCurrentGrid([...grid]);
		setIsRunning(true);

		stepperRef.current = defragStepper(grid);
		startSpindle();

		const delay = 500 + Math.random() * 1000;
		timerRef.current = setTimeout(() => tickRef.current?.(), delay);
	}, [stop]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			stopSpindle();
		};
	}, []);

	return { initialGrid, currentGrid, isRunning, start, stop };
}
