let audioCtx: AudioContext | null = null;
let spindleNode: AudioBufferSourceNode | null = null;
let spindleGain: GainNode | null = null;

function getCtx(): AudioContext {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	return audioCtx;
}

/** Low rumbling hum — spindle motor + bearing noise */
export function startSpindle() {
	const ctx = getCtx();
	if (spindleNode) return;

	const sampleRate = ctx.sampleRate;
	const length = sampleRate * 2;
	const buffer = ctx.createBuffer(1, length, sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i++) {
		const phase = (i / sampleRate) * 120 * Math.PI * 2;
		data[i] =
			(Math.random() * 2 - 1) * 0.03 +
			Math.sin(phase) * 0.015 +
			Math.sin(phase * 2.02) * 0.008;
	}

	spindleNode = ctx.createBufferSource();
	spindleNode.buffer = buffer;
	spindleNode.loop = true;

	const lowpass = ctx.createBiquadFilter();
	lowpass.type = "lowpass";
	lowpass.frequency.value = 250;

	spindleGain = ctx.createGain();
	spindleGain.gain.value = 0.35;

	spindleNode.connect(lowpass);
	lowpass.connect(spindleGain);
	spindleGain.connect(ctx.destination);
	spindleNode.start();
}

export function stopSpindle() {
	if (spindleNode) {
		spindleNode.stop();
		spindleNode.disconnect();
		spindleNode = null;
	}
	if (spindleGain) {
		spindleGain.disconnect();
		spindleGain = null;
	}
}

/** Single mechanical click — voice coil actuator */
function playClick(time: number, volume: number) {
	const ctx = getCtx();

	const osc = ctx.createOscillator();
	osc.type = "triangle";
	osc.frequency.setValueAtTime(500 + Math.random() * 300, time);
	osc.frequency.exponentialRampToValueAtTime(150, time + 0.008);

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(volume, time);
	gain.gain.exponentialRampToValueAtTime(0.001, time + 0.012);

	const lp = ctx.createBiquadFilter();
	lp.type = "lowpass";
	lp.frequency.value = 1800;

	osc.connect(lp);
	lp.connect(gain);
	gain.connect(ctx.destination);

	osc.start(time);
	osc.stop(time + 0.015);
}

/** Seek: rapid "chk-chk-chk" as head steps across tracks */
function playSeek(time: number) {
	const clicks = 2 + Math.floor(Math.random() * 5);
	const spacing = 0.012 + Math.random() * 0.018;
	const vol = 0.08 + Math.random() * 0.06;

	for (let i = 0; i < clicks; i++) {
		playClick(time + i * spacing, vol * (0.8 + Math.random() * 0.4));
	}

	return clicks * spacing;
}

/** Settle click after a seek */
function playSettle(time: number) {
	playClick(time, 0.12 + Math.random() * 0.05);
}

/** One crunch: seek-settle cycle */
export function playDefragBurst() {
	const ctx = getCtx();
	const now = ctx.currentTime;

	const cycles = 2 + Math.floor(Math.random() * 4);
	let t = now;

	for (let c = 0; c < cycles; c++) {
		const seekDur = playSeek(t);
		t += seekDur;
		playSettle(t);
		t += 0.02 + Math.random() * 0.06;
	}
}

/** Completion chime */
export function playComplete() {
	const ctx = getCtx();
	const now = ctx.currentTime;

	const notes = [523.25, 659.25, 783.99];
	for (let i = 0; i < notes.length; i++) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = "sine";
		osc.frequency.value = notes[i];

		const start = now + i * 0.15;
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(start);
		osc.stop(start + 0.4);
	}
}

export function resumeAudio() {
	const ctx = getCtx();
	if (ctx.state === "suspended") {
		ctx.resume();
	}
}
