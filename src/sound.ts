let audioCtx: AudioContext | null = null;
let spindleNode: AudioBufferSourceNode | null = null;
let spindleGain: GainNode | null = null;

function getCtx(): AudioContext {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	return audioCtx;
}

/** Continuous low spindle motor hum — runs the whole time the drive is "active" */
export function startSpindle() {
	const ctx = getCtx();
	if (spindleNode) return;

	// Create a looping noise buffer for the spindle whir
	const sampleRate = ctx.sampleRate;
	const length = sampleRate * 2;
	const buffer = ctx.createBuffer(1, length, sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i++) {
		// Mix a low rumble with subtle periodic content (spindle rotation)
		const phase = (i / sampleRate) * 120 * Math.PI * 2; // ~60Hz rotation
		data[i] =
			(Math.random() * 2 - 1) * 0.03 + // noise floor
			Math.sin(phase) * 0.015 + // fundamental hum
			Math.sin(phase * 2.02) * 0.008; // slight harmonic wobble
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

/** Hard metallic click — the head slamming into position */
function playHeadClick() {
	const ctx = getCtx();
	const now = ctx.currentTime;

	// Sharp impulse via short noise burst
	const len = Math.floor(ctx.sampleRate * 0.004);
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) {
		const env = 1 - i / len;
		d[i] = (Math.random() * 2 - 1) * env * env;
	}

	const src = ctx.createBufferSource();
	src.buffer = buf;

	// Resonant peak gives it that metallic "tick"
	const peak = ctx.createBiquadFilter();
	peak.type = "bandpass";
	peak.frequency.value = 2000 + Math.random() * 2000;
	peak.Q.value = 8 + Math.random() * 8;

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.25 + Math.random() * 0.15, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

	src.connect(peak);
	peak.connect(gain);
	gain.connect(ctx.destination);
	src.start(now);
}

/** Longer grinding seek — head traversing multiple tracks */
function playSeekGrind() {
	const ctx = getCtx();
	const now = ctx.currentTime;
	const duration = 0.02 + Math.random() * 0.04;

	const len = Math.floor(ctx.sampleRate * duration);
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const d = buf.getChannelData(0);
	// Harsh, crunchy noise
	for (let i = 0; i < len; i++) {
		const env = (1 - i / len) ** 0.5;
		// Square-ish noise for that gritty texture
		d[i] = (Math.random() > 0.5 ? 1 : -1) * env * 0.5 * Math.random();
	}

	const src = ctx.createBufferSource();
	src.buffer = buf;

	const bp = ctx.createBiquadFilter();
	bp.type = "bandpass";
	bp.frequency.value = 1200 + Math.random() * 1500;
	bp.Q.value = 3 + Math.random() * 4;

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.18, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

	src.connect(bp);
	bp.connect(gain);
	gain.connect(ctx.destination);
	src.start(now);
}

/** Read/write chatter — rapid staccato clicks like data being transferred */
function playReadChatter() {
	const ctx = getCtx();
	const now = ctx.currentTime;
	const clicks = 3 + Math.floor(Math.random() * 6);

	for (let c = 0; c < clicks; c++) {
		const offset = c * (0.008 + Math.random() * 0.012);
		const len = Math.floor(ctx.sampleRate * 0.003);
		const buf = ctx.createBuffer(1, len, ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < len; i++) {
			d[i] = (Math.random() * 2 - 1) * (1 - i / len);
		}

		const src = ctx.createBufferSource();
		src.buffer = buf;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 3000 + Math.random() * 2000;

		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0.12 + Math.random() * 0.08, now + offset);
		gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.005);

		src.connect(hp);
		hp.connect(gain);
		gain.connect(ctx.destination);
		src.start(now + offset);
	}
}

/** Heavy burst of activity — what you hear when defrag is really working hard */
export function playDefragBurst() {
	// Rapid-fire sequence: seek, clicks, chatter, more seeks
	const events = 6 + Math.floor(Math.random() * 8);
	for (let i = 0; i < events; i++) {
		setTimeout(
			() => {
				const r = Math.random();
				if (r < 0.35) {
					playHeadClick();
				} else if (r < 0.6) {
					playSeekGrind();
				} else if (r < 0.85) {
					playReadChatter();
				} else {
					// Double click — head bouncing
					playHeadClick();
					setTimeout(playHeadClick, 3 + Math.random() * 8);
				}
			},
			i * (8 + Math.random() * 25),
		);
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
