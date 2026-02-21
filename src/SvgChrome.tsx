import type { ReactNode } from "react";

interface SvgChromeProps {
	topBarContent?: ReactNode;
	bottomBarContent?: ReactNode;
}

/** Static Win2000 Disk Defragmenter window chrome rendered as JSX SVG. */
export default function SvgChrome({
	topBarContent,
	bottomBarContent,
}: SvgChromeProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 640 280"
			width="100%"
			height="100%"
			style={{ backgroundColor: "#111" }}
		>
			<title>Disk Defragmenter</title>
			<defs>
				<style>{`
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
        `}</style>
			</defs>

			<g transform="translate(16, 16)">
				{/* Window background + borders */}
				<rect x="0" y="0" width="608" height="248" className="bg" />
				<line x1="0" y1="0" x2="607" y2="0" className="border-light" />
				<line x1="0" y1="0" x2="0" y2="247" className="border-light" />
				<line x1="607" y1="1" x2="607" y2="247" className="border-black" />
				<line x1="1" y1="247" x2="607" y2="247" className="border-black" />
				<line x1="606" y1="2" x2="606" y2="246" className="border-dark" />
				<line x1="2" y1="246" x2="606" y2="246" className="border-dark" />

				{/* Labels */}
				<text x="12" y="24" className="text-base">
					Estimated disk usage before defragmentation:
				</text>
				<text x="12" y="94" className="text-base">
					Estimated disk usage after defragmentation:
				</text>

				{/* Top bar frame */}
				<g transform="translate(12, 32)">
					<rect x="0" y="0" width="582" height="32" className="bar-bg" />
					<line x1="0" y1="0" x2="581" y2="0" className="border-dark" />
					<line x1="0" y1="0" x2="0" y2="31" className="border-dark" />
					<line x1="581" y1="1" x2="581" y2="31" className="border-light" />
					<line x1="1" y1="31" x2="581" y2="31" className="border-light" />
					<line x1="1" y1="1" x2="580" y2="1" className="border-black" />
					<line x1="1" y1="1" x2="1" y2="30" className="border-black" />
					<g transform="translate(2, 1)">{topBarContent}</g>
				</g>

				{/* Bottom bar frame */}
				<g transform="translate(12, 102)">
					<rect x="0" y="0" width="582" height="32" className="bar-bg" />
					<line x1="0" y1="0" x2="581" y2="0" className="border-dark" />
					<line x1="0" y1="0" x2="0" y2="31" className="border-dark" />
					<line x1="581" y1="1" x2="581" y2="31" className="border-light" />
					<line x1="1" y1="31" x2="581" y2="31" className="border-light" />
					<line x1="1" y1="1" x2="580" y2="1" className="border-black" />
					<line x1="1" y1="1" x2="1" y2="30" className="border-black" />
					<g transform="translate(2, 1)">{bottomBarContent}</g>
				</g>

				{/* Analyze button */}
				<g transform="translate(12, 152)">
					<rect x="0" y="0" width="76" height="23" className="bg" />
					<line x1="0" y1="0" x2="74" y2="0" className="border-light" />
					<line x1="0" y1="0" x2="0" y2="21" className="border-light" />
					<line x1="75" y1="0" x2="75" y2="22" className="border-black" />
					<line x1="0" y1="22" x2="75" y2="22" className="border-black" />
					<line x1="74" y1="1" x2="74" y2="21" className="border-dark" />
					<line x1="1" y1="21" x2="74" y2="21" className="border-dark" />
					<text x="38" y="15" textAnchor="middle" className="text-base">
						Analyze
					</text>
				</g>

				{/* Defragment button */}
				<g transform="translate(93, 152)">
					<rect x="0" y="0" width="82" height="23" className="bg" />
					<line x1="0" y1="0" x2="80" y2="0" className="border-light" />
					<line x1="0" y1="0" x2="0" y2="21" className="border-light" />
					<line x1="81" y1="0" x2="81" y2="22" className="border-black" />
					<line x1="0" y1="22" x2="81" y2="22" className="border-black" />
					<line x1="80" y1="1" x2="80" y2="21" className="border-dark" />
					<line x1="1" y1="21" x2="80" y2="21" className="border-dark" />
					<text x="41" y="15" textAnchor="middle" className="text-base">
						Defragment
					</text>
				</g>

				{/* Pause button (disabled) */}
				<g transform="translate(181, 152)">
					<rect x="0" y="0" width="76" height="23" className="bg" />
					<line x1="0" y1="0" x2="74" y2="0" className="border-light" />
					<line x1="0" y1="0" x2="0" y2="21" className="border-light" />
					<line x1="75" y1="0" x2="75" y2="22" className="border-black" />
					<line x1="0" y1="22" x2="75" y2="22" className="border-black" />
					<line x1="74" y1="1" x2="74" y2="21" className="border-dark" />
					<line x1="1" y1="21" x2="74" y2="21" className="border-dark" />
					<text
						x="39"
						y="16"
						textAnchor="middle"
						className="text-base text-disabled-shadow"
					>
						Pause
					</text>
					<text
						x="38"
						y="15"
						textAnchor="middle"
						className="text-base text-disabled"
					>
						Pause
					</text>
				</g>

				{/* Stop button (disabled) */}
				<g transform="translate(262, 152)">
					<rect x="0" y="0" width="76" height="23" className="bg" />
					<line x1="0" y1="0" x2="74" y2="0" className="border-light" />
					<line x1="0" y1="0" x2="0" y2="21" className="border-light" />
					<line x1="75" y1="0" x2="75" y2="22" className="border-black" />
					<line x1="0" y1="22" x2="75" y2="22" className="border-black" />
					<line x1="74" y1="1" x2="74" y2="21" className="border-dark" />
					<line x1="1" y1="21" x2="74" y2="21" className="border-dark" />
					<text
						x="39"
						y="16"
						textAnchor="middle"
						className="text-base text-disabled-shadow"
					>
						Stop
					</text>
					<text
						x="38"
						y="15"
						textAnchor="middle"
						className="text-base text-disabled"
					>
						Stop
					</text>
				</g>

				{/* View Report button */}
				<g transform="translate(344, 152)">
					<rect x="0" y="0" width="82" height="23" className="bg" />
					<line x1="0" y1="0" x2="80" y2="0" className="border-light" />
					<line x1="0" y1="0" x2="0" y2="21" className="border-light" />
					<line x1="81" y1="0" x2="81" y2="22" className="border-black" />
					<line x1="0" y1="22" x2="81" y2="22" className="border-black" />
					<line x1="80" y1="1" x2="80" y2="21" className="border-dark" />
					<line x1="1" y1="21" x2="80" y2="21" className="border-dark" />
					<text x="41" y="15" textAnchor="middle" className="text-base">
						View Report
					</text>
				</g>

				{/* Separator */}
				<line x1="12" y1="192" x2="594" y2="192" className="border-dark" />
				<line x1="12" y1="193" x2="594" y2="193" className="border-light" />

				{/* Legend */}
				<g transform="translate(12, 206)">
					<rect x="0" y="2" width="10" height="10" className="frag-red" />
					<rect x="0" y="2" width="10" height="10" className="border-dark" />
					<text x="16" y="11" className="text-base">
						Fragmented files
					</text>

					<rect x="105" y="2" width="10" height="10" className="cont-blue" />
					<rect x="105" y="2" width="10" height="10" className="border-dark" />
					<text x="121" y="11" className="text-base">
						Contiguous files
					</text>

					<rect x="206" y="2" width="10" height="10" className="unmv-green" />
					<rect x="206" y="2" width="10" height="10" className="border-dark" />
					<text x="222" y="11" className="text-base">
						Unmovable files
					</text>

					<rect x="309" y="2" width="10" height="10" className="free-white" />
					<rect x="309" y="2" width="10" height="10" className="border-dark" />
					<text x="325" y="11" className="text-base">
						Free space
					</text>
				</g>
			</g>
		</svg>
	);
}
