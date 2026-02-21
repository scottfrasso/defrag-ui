import { useCallback, useEffect, useRef, useState } from "react";
import {
	playComplete,
	playDefragBurst,
	resumeAudio,
	startSpindle,
	stopSpindle,
} from "./sound";

const ANIMATION_DURATION = 24000; // 24s matches the SVG animation dur

// The keyTimes from the SVG scan-clip animation, mapped to progress values
// These are the points where the scan "jumps" (stutters) — we play sounds at each jump
const SCAN_KEY_TIMES = [
	0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.35, 0.45, 0.5, 0.55, 0.65, 0.7, 0.75, 0.82,
	0.85, 0.88, 0.92, 0.94, 0.96, 0.98, 0.99, 1,
];

export default function DefragUI() {
	const [isRunning, setIsRunning] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const svgRef = useRef<HTMLDivElement>(null);
	const soundTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearAllTimers = useCallback(() => {
		for (const t of soundTimersRef.current) {
			clearTimeout(t);
		}
		soundTimersRef.current = [];
		if (cycleTimerRef.current) {
			clearTimeout(cycleTimerRef.current);
			cycleTimerRef.current = null;
		}
	}, []);

	const scheduleSounds = useCallback(() => {
		clearAllTimers();
		startSpindle();

		// Schedule bursts at each keyTime jump AND fill gaps with continuous chatter
		for (let i = 1; i < SCAN_KEY_TIMES.length; i++) {
			const prevTime = SCAN_KEY_TIMES[i - 1];
			const thisTime = SCAN_KEY_TIMES[i];
			if (thisTime > prevTime) {
				const startMs = prevTime * ANIMATION_DURATION;
				const endMs = thisTime * ANIMATION_DURATION;
				// Heavy burst right at the transition
				const t1 = setTimeout(() => playDefragBurst(), endMs);
				soundTimersRef.current.push(t1);
				// Fill the active period with continuous seeking noise
				const gap = endMs - startMs;
				const fills = Math.floor(gap / 300);
				for (let f = 1; f <= fills; f++) {
					const t = setTimeout(
						() => playDefragBurst(),
						startMs + f * (gap / (fills + 1)),
					);
					soundTimersRef.current.push(t);
				}
			}
		}

		// Completion chime at end of cycle, then re-schedule
		cycleTimerRef.current = setTimeout(() => {
			playComplete();
			scheduleSounds();
		}, ANIMATION_DURATION);
	}, [clearAllTimers]);

	const handleClick = useCallback(() => {
		resumeAudio();
		if (!hasStarted) {
			setHasStarted(true);
			setIsRunning(true);
			scheduleSounds();
		}
	}, [hasStarted, scheduleSounds]);

	const handleStop = useCallback(() => {
		clearAllTimers();
		stopSpindle();
		setIsRunning(false);
		setHasStarted(false);
	}, [clearAllTimers]);

	// Pause/unpause SVG animations
	useEffect(() => {
		const svgEl = svgRef.current?.querySelector("svg");
		if (!svgEl) return;

		if (isRunning) {
			svgEl.unpauseAnimations();
		} else {
			svgEl.pauseAnimations();
		}
	}, [isRunning]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearAllTimers();
			stopSpindle();
		};
	}, [clearAllTimers]);

	// Pause animations on initial mount (before user clicks Defragment)
	useEffect(() => {
		const svgEl = svgRef.current?.querySelector("svg");
		if (svgEl) {
			// Small delay to let the SVG initialize
			const t = setTimeout(() => svgEl.pauseAnimations(), 50);
			return () => clearTimeout(t);
		}
	}, []);

	return (
		// biome-ignore lint/a11y/useSemanticElements: full-screen click area, not a standard button
		<div
			className="defrag-container"
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") handleClick();
			}}
			role="button"
			tabIndex={0}
		>
			<div
				ref={svgRef}
				className="svg-wrapper"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static SVG content
				dangerouslySetInnerHTML={{
					__html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 280" width="100%" height="100%" style="background-color: #111;">
  <defs>
    <style>
      .bg { fill: #D4D0C8; }
      .text-base { font-family: Tahoma, 'MS Sans Serif', 'Segoe UI', sans-serif; font-size: 11px; fill: #000000; shape-rendering: crispEdges; }
      .text-disabled { fill: #808080; }
      .text-disabled-shadow { fill: #FFFFFF; }
      .border-dark { stroke: #808080; stroke-width: 1; fill: none; shape-rendering: crispEdges; }
      .border-light { stroke: #FFFFFF; stroke-width: 1; fill: none; shape-rendering: crispEdges; }
      .border-black { stroke: #404040; stroke-width: 1; fill: none; shape-rendering: crispEdges; }
      .bar-bg { fill: #FFFFFF; shape-rendering: crispEdges; }
      .frag-red { fill: #E00000; shape-rendering: crispEdges; }
      .cont-blue { fill: #0000C0; shape-rendering: crispEdges; }
      .unmv-green { fill: #00C000; shape-rendering: crispEdges; }
      .free-white { fill: #FFFFFF; shape-rendering: crispEdges; }
    </style>

    <g id="fragmented-data">
      <rect x="0" y="0" width="10" height="30" class="cont-blue"/>
      <rect x="10" y="0" width="2" height="30" class="frag-red"/>
      <rect x="12" y="0" width="8" height="30" class="cont-blue"/>
      <rect x="20" y="0" width="3" height="30" class="free-white"/>
      <rect x="23" y="0" width="15" height="30" class="cont-blue"/>
      <rect x="38" y="0" width="2" height="30" class="frag-red"/>
      <rect x="40" y="0" width="12" height="30" class="cont-blue"/>
      <rect x="52" y="0" width="4" height="30" class="free-white"/>
      <rect x="56" y="0" width="2" height="30" class="frag-red"/>
      <rect x="58" y="0" width="6" height="30" class="cont-blue"/>
      <rect x="64" y="0" width="1" height="30" class="frag-red"/>
      <rect x="65" y="0" width="15" height="30" class="free-white"/>
      <rect x="80" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="81" y="0" width="3" height="30" class="free-white"/>
      <rect x="84" y="0" width="2" height="30" class="frag-red"/>
      <rect x="86" y="0" width="14" height="30" class="free-white"/>
      <rect x="100" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="101" y="0" width="4" height="30" class="free-white"/>
      <rect x="105" y="0" width="2" height="30" class="frag-red"/>
      <rect x="107" y="0" width="13" height="30" class="free-white"/>
      <rect x="120" y="0" width="18" height="30" class="unmv-green"/>
      <rect x="138" y="0" width="5" height="30" class="free-white"/>
      <rect x="143" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="144" y="0" width="3" height="30" class="free-white"/>
      <rect x="147" y="0" width="2" height="30" class="frag-red"/>
      <rect x="149" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="150" y="0" width="8" height="30" class="free-white"/>
      <rect x="158" y="0" width="2" height="30" class="frag-red"/>
      <rect x="160" y="0" width="10" height="30" class="free-white"/>
      <rect x="170" y="0" width="3" height="30" class="cont-blue"/>
      <rect x="173" y="0" width="1" height="30" class="frag-red"/>
      <rect x="174" y="0" width="5" height="30" class="cont-blue"/>
      <rect x="179" y="0" width="2" height="30" class="frag-red"/>
      <rect x="181" y="0" width="6" height="30" class="cont-blue"/>
      <rect x="187" y="0" width="1" height="30" class="frag-red"/>
      <rect x="188" y="0" width="12" height="30" class="cont-blue"/>
      <rect x="200" y="0" width="15" height="30" class="free-white"/>
      <rect x="215" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="217" y="0" width="8" height="30" class="free-white"/>
      <rect x="225" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="226" y="0" width="4" height="30" class="free-white"/>
      <rect x="230" y="0" width="1" height="30" class="frag-red"/>
      <rect x="231" y="0" width="9" height="30" class="free-white"/>
      <rect x="240" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="241" y="0" width="14" height="30" class="free-white"/>
      <rect x="255" y="0" width="6" height="30" class="frag-red"/>
      <rect x="261" y="0" width="4" height="30" class="free-white"/>
      <rect x="265" y="0" width="12" height="30" class="frag-red"/>
      <rect x="277" y="0" width="3" height="30" class="free-white"/>
      <rect x="280" y="0" width="10" height="30" class="frag-red"/>
      <rect x="290" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="291" y="0" width="8" height="30" class="free-white"/>
      <rect x="299" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="301" y="0" width="9" height="30" class="free-white"/>
      <rect x="310" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="311" y="0" width="1" height="30" class="frag-red"/>
      <rect x="312" y="0" width="8" height="30" class="free-white"/>
      <rect x="320" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="322" y="0" width="7" height="30" class="free-white"/>
      <rect x="329" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="330" y="0" width="9" height="30" class="free-white"/>
      <rect x="339" y="0" width="1" height="30" class="frag-red"/>
      <rect x="340" y="0" width="5" height="30" class="free-white"/>
      <rect x="345" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="347" y="0" width="3" height="30" class="free-white"/>
      <rect x="350" y="0" width="1" height="30" class="frag-red"/>
      <rect x="351" y="0" width="9" height="30" class="free-white"/>
      <rect x="360" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="362" y="0" width="3" height="30" class="free-white"/>
      <rect x="365" y="0" width="1" height="30" class="frag-red"/>
      <rect x="366" y="0" width="4" height="30" class="free-white"/>
      <rect x="370" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="372" y="0" width="8" height="30" class="free-white"/>
      <rect x="380" y="0" width="1" height="30" class="frag-red"/>
      <rect x="381" y="0" width="4" height="30" class="free-white"/>
      <rect x="385" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="387" y="0" width="3" height="30" class="free-white"/>
      <rect x="390" y="0" width="1" height="30" class="frag-red"/>
      <rect x="391" y="0" width="9" height="30" class="free-white"/>
      <rect x="400" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="402" y="0" width="3" height="30" class="free-white"/>
      <rect x="405" y="0" width="1" height="30" class="frag-red"/>
      <rect x="406" y="0" width="4" height="30" class="free-white"/>
      <rect x="410" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="411" y="0" width="8" height="30" class="free-white"/>
      <rect x="419" y="0" width="1" height="30" class="frag-red"/>
      <rect x="420" y="0" width="4" height="30" class="free-white"/>
      <rect x="424" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="426" y="0" width="4" height="30" class="free-white"/>
      <rect x="430" y="0" width="1" height="30" class="frag-red"/>
      <rect x="431" y="0" width="9" height="30" class="free-white"/>
      <rect x="440" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="441" y="0" width="4" height="30" class="free-white"/>
      <rect x="445" y="0" width="2" height="30" class="frag-red"/>
      <rect x="447" y="0" width="3" height="30" class="free-white"/>
      <rect x="450" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="451" y="0" width="9" height="30" class="free-white"/>
      <rect x="460" y="0" width="2" height="30" class="frag-red"/>
      <rect x="462" y="0" width="3" height="30" class="free-white"/>
      <rect x="465" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="466" y="0" width="4" height="30" class="free-white"/>
      <rect x="470" y="0" width="1" height="30" class="frag-red"/>
      <rect x="471" y="0" width="8" height="30" class="free-white"/>
      <rect x="479" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="480" y="0" width="4" height="30" class="free-white"/>
      <rect x="484" y="0" width="2" height="30" class="frag-red"/>
      <rect x="486" y="0" width="4" height="30" class="free-white"/>
      <rect x="490" y="0" width="1" height="30" class="cont-blue"/>
      <rect x="491" y="0" width="9" height="30" class="free-white"/>
      <rect x="500" y="0" width="1" height="30" class="frag-red"/>
      <rect x="501" y="0" width="4" height="30" class="free-white"/>
      <rect x="505" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="507" y="0" width="3" height="30" class="free-white"/>
      <rect x="510" y="0" width="1" height="30" class="frag-red"/>
      <rect x="511" y="0" width="9" height="30" class="free-white"/>
      <rect x="520" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="522" y="0" width="3" height="30" class="free-white"/>
      <rect x="525" y="0" width="1" height="30" class="frag-red"/>
      <rect x="526" y="0" width="4" height="30" class="free-white"/>
      <rect x="530" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="532" y="0" width="8" height="30" class="free-white"/>
      <rect x="540" y="0" width="1" height="30" class="frag-red"/>
      <rect x="541" y="0" width="4" height="30" class="free-white"/>
      <rect x="545" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="547" y="0" width="3" height="30" class="free-white"/>
      <rect x="550" y="0" width="1" height="30" class="frag-red"/>
      <rect x="551" y="0" width="9" height="30" class="free-white"/>
      <rect x="560" y="0" width="2" height="30" class="cont-blue"/>
      <rect x="562" y="0" width="3" height="30" class="free-white"/>
      <rect x="565" y="0" width="1" height="30" class="frag-red"/>
      <rect x="566" y="0" width="14" height="30" class="free-white"/>
    </g>

    <g id="sorted-data">
      <rect x="0" y="0" width="45" height="30" class="cont-blue"/>
      <rect x="45" y="0" width="1" height="30" class="free-white"/>
      <rect x="46" y="0" width="25" height="30" class="cont-blue"/>
      <rect x="71" y="0" width="1" height="30" class="free-white"/>
      <rect x="72" y="0" width="18" height="30" class="cont-blue"/>
      <rect x="90" y="0" width="1" height="30" class="free-white"/>
      <rect x="91" y="0" width="14" height="30" class="cont-blue"/>
      <rect x="105" y="0" width="15" height="30" class="free-white"/>
      <rect x="120" y="0" width="18" height="30" class="unmv-green"/>
      <rect x="138" y="0" width="2" height="30" class="free-white"/>
      <rect x="140" y="0" width="15" height="30" class="cont-blue"/>
      <rect x="155" y="0" width="1" height="30" class="free-white"/>
      <rect x="156" y="0" width="10" height="30" class="cont-blue"/>
      <rect x="166" y="0" width="2" height="30" class="free-white"/>
      <rect x="168" y="0" width="8" height="30" class="cont-blue"/>
      <rect x="176" y="0" width="20" height="30" class="free-white"/>
      <rect x="196" y="0" width="12" height="30" class="cont-blue"/>
      <rect x="208" y="0" width="1" height="30" class="free-white"/>
      <rect x="209" y="0" width="6" height="30" class="cont-blue"/>
      <rect x="215" y="0" width="8" height="30" class="free-white"/>
      <rect x="223" y="0" width="12" height="30" class="cont-blue"/>
      <rect x="235" y="0" width="2" height="30" class="free-white"/>
      <rect x="237" y="0" width="8" height="30" class="cont-blue"/>
      <rect x="245" y="0" width="3" height="30" class="free-white"/>
      <rect x="248" y="0" width="6" height="30" class="cont-blue"/>
      <rect x="254" y="0" width="1" height="30" class="free-white"/>
      <rect x="255" y="0" width="4" height="30" class="cont-blue"/>
      <rect x="259" y="0" width="321" height="30" class="free-white"/>
    </g>

    <clipPath id="scan-clip">
      <rect x="0" y="0" width="0" height="30">
        <animate attributeName="width"
                 values="0; 40; 40; 80; 90; 90; 130; 130; 190; 210; 210; 260; 280; 280; 340; 390; 390; 460; 520; 520; 580; 580"
                 keyTimes="0; 0.05; 0.1; 0.15; 0.2; 0.3; 0.35; 0.45; 0.5; 0.55; 0.65; 0.7; 0.75; 0.82; 0.85; 0.88; 0.92; 0.94; 0.96; 0.98; 0.99; 1"
                 dur="24s" repeatCount="indefinite" />
      </rect>
    </clipPath>
  </defs>

  <g transform="translate(16, 16)">
    <rect x="0" y="0" width="608" height="248" class="bg"/>
    <line x1="0" y1="0" x2="607" y2="0" class="border-light"/>
    <line x1="0" y1="0" x2="0" y2="247" class="border-light"/>
    <line x1="607" y1="1" x2="607" y2="247" class="border-black"/>
    <line x1="1" y1="247" x2="607" y2="247" class="border-black"/>
    <line x1="606" y1="2" x2="606" y2="246" class="border-dark"/>
    <line x1="2" y1="246" x2="606" y2="246" class="border-dark"/>

    <text x="12" y="24" class="text-base">Estimated disk usage before defragmentation:</text>
    <text x="12" y="94" class="text-base">Estimated disk usage after defragmentation:</text>

    <g transform="translate(12, 32)">
      <rect x="0" y="0" width="582" height="32" class="bar-bg"/>
      <line x1="0" y1="0" x2="581" y2="0" class="border-dark"/>
      <line x1="0" y1="0" x2="0" y2="31" class="border-dark"/>
      <line x1="581" y1="1" x2="581" y2="31" class="border-light"/>
      <line x1="1" y1="31" x2="581" y2="31" class="border-light"/>
      <line x1="1" y1="1" x2="580" y2="1" class="border-black"/>
      <line x1="1" y1="1" x2="1" y2="30" class="border-black"/>
      <use href="#fragmented-data" x="2" y="1" />
    </g>

    <g transform="translate(12, 102)">
      <rect x="0" y="0" width="582" height="32" class="bar-bg"/>
      <line x1="0" y1="0" x2="581" y2="0" class="border-dark"/>
      <line x1="0" y1="0" x2="0" y2="31" class="border-dark"/>
      <line x1="581" y1="1" x2="581" y2="31" class="border-light"/>
      <line x1="1" y1="31" x2="581" y2="31" class="border-light"/>
      <line x1="1" y1="1" x2="580" y2="1" class="border-black"/>
      <line x1="1" y1="1" x2="1" y2="30" class="border-black"/>
      <use href="#fragmented-data" x="2" y="1" />
      <use href="#sorted-data" x="2" y="1" clip-path="url(#scan-clip)" />
    </g>

    <g transform="translate(12, 152)">
      <rect x="0" y="0" width="76" height="23" class="bg"/>
      <line x1="0" y1="0" x2="74" y2="0" class="border-light"/>
      <line x1="0" y1="0" x2="0" y2="21" class="border-light"/>
      <line x1="75" y1="0" x2="75" y2="22" class="border-black"/>
      <line x1="0" y1="22" x2="75" y2="22" class="border-black"/>
      <line x1="74" y1="1" x2="74" y2="21" class="border-dark"/>
      <line x1="1" y1="21" x2="74" y2="21" class="border-dark"/>
      <text x="38" y="15" text-anchor="middle" class="text-base">Analyze</text>
    </g>

    <g transform="translate(93, 152)">
      <rect x="0" y="0" width="82" height="23" class="bg"/>
      <line x1="0" y1="0" x2="80" y2="0" class="border-light"/>
      <line x1="0" y1="0" x2="0" y2="21" class="border-light"/>
      <line x1="81" y1="0" x2="81" y2="22" class="border-black"/>
      <line x1="0" y1="22" x2="81" y2="22" class="border-black"/>
      <line x1="80" y1="1" x2="80" y2="21" class="border-dark"/>
      <line x1="1" y1="21" x2="80" y2="21" class="border-dark"/>
      <rect x="1" y="1" width="80" height="21" fill="none">
        <animate attributeName="stroke" values="none; #000000; none" keyTimes="0; 0.01; 0.99" dur="24s" repeatCount="indefinite" stroke-width="1" stroke-dasharray="1,1"/>
      </rect>
      <text x="41" y="15" text-anchor="middle" class="text-base">Defragment</text>
    </g>

    <g transform="translate(181, 152)">
      <rect x="0" y="0" width="76" height="23" class="bg"/>
      <line x1="0" y1="0" x2="74" y2="0" class="border-light"/>
      <line x1="0" y1="0" x2="0" y2="21" class="border-light"/>
      <line x1="75" y1="0" x2="75" y2="22" class="border-black"/>
      <line x1="0" y1="22" x2="75" y2="22" class="border-black"/>
      <line x1="74" y1="1" x2="74" y2="21" class="border-dark"/>
      <line x1="1" y1="21" x2="74" y2="21" class="border-dark"/>
      <text x="39" y="16" text-anchor="middle" class="text-base text-disabled-shadow">Pause</text>
      <text x="38" y="15" text-anchor="middle" class="text-base text-disabled">Pause</text>
    </g>

    <g transform="translate(262, 152)">
      <rect x="0" y="0" width="76" height="23" class="bg"/>
      <line x1="0" y1="0" x2="74" y2="0" class="border-light"/>
      <line x1="0" y1="0" x2="0" y2="21" class="border-light"/>
      <line x1="75" y1="0" x2="75" y2="22" class="border-black"/>
      <line x1="0" y1="22" x2="75" y2="22" class="border-black"/>
      <line x1="74" y1="1" x2="74" y2="21" class="border-dark"/>
      <line x1="1" y1="21" x2="74" y2="21" class="border-dark"/>
      <text x="39" y="16" text-anchor="middle" class="text-base text-disabled-shadow">Stop</text>
      <text x="38" y="15" text-anchor="middle" class="text-base text-disabled">Stop</text>
    </g>

    <g transform="translate(344, 152)">
      <rect x="0" y="0" width="82" height="23" class="bg"/>
      <line x1="0" y1="0" x2="80" y2="0" class="border-light"/>
      <line x1="0" y1="0" x2="0" y2="21" class="border-light"/>
      <line x1="81" y1="0" x2="81" y2="22" class="border-black"/>
      <line x1="0" y1="22" x2="81" y2="22" class="border-black"/>
      <line x1="80" y1="1" x2="80" y2="21" class="border-dark"/>
      <line x1="1" y1="21" x2="80" y2="21" class="border-dark"/>
      <text x="41" y="15" text-anchor="middle" class="text-base">View Report</text>
    </g>

    <line x1="12" y1="192" x2="594" y2="192" class="border-dark"/>
    <line x1="12" y1="193" x2="594" y2="193" class="border-light"/>

    <g transform="translate(12, 206)">
      <rect x="0" y="2" width="10" height="10" class="frag-red"/>
      <rect x="0" y="2" width="10" height="10" class="border-dark"/>
      <text x="16" y="11" class="text-base">Fragmented files</text>

      <rect x="105" y="2" width="10" height="10" class="cont-blue"/>
      <rect x="105" y="2" width="10" height="10" class="border-dark"/>
      <text x="121" y="11" class="text-base">Contiguous files</text>

      <rect x="206" y="2" width="10" height="10" class="unmv-green"/>
      <rect x="206" y="2" width="10" height="10" class="border-dark"/>
      <text x="222" y="11" class="text-base">Unmovable files</text>

      <rect x="309" y="2" width="10" height="10" class="free-white"/>
      <rect x="309" y="2" width="10" height="10" class="border-dark"/>
      <text x="325" y="11" class="text-base">Free space</text>
    </g>
  </g>
</svg>`,
				}}
			/>
			{!hasStarted && (
				<div className="click-prompt">
					Click anywhere to start defragmenting
				</div>
			)}
			{isRunning && (
				<button type="button" className="stop-btn" onClick={handleStop}>
					Stop
				</button>
			)}
		</div>
	);
}
