export const GEMINI_LIVE_MODEL = "gemini-3.8-live";
/** The SDK only supports ephemeral (constrained) Live sessions on v1alpha. */
export const GEMINI_API_VERSION = "v1alpha";

const INPUT_RATE = 16_000;
const OUTPUT_RATE = 24_000;

export function int16ToBase64(samples: Int16Array): string {
  const bytes = new Uint8Array(
    samples.buffer,
    samples.byteOffset,
    samples.byteLength,
  );
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Decodes little-endian 16-bit PCM into Web Audio floats. */
export function base64ToFloat32(data: string): Float32Array<ArrayBuffer> {
  const binary = atob(data);
  const view = new DataView(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++)
    view.setUint8(i, binary.charCodeAt(i));
  const out = new Float32Array(binary.length >> 1);
  for (let i = 0; i < out.length; i++)
    out[i] = view.getInt16(i * 2, true) / 0x8000;
  return out;
}

// Inlined so the project stays free of .js files; loaded through a Blob URL.
// Resamples the mic to 16 kHz with linear interpolation and posts 100 ms PCM16 chunks.
const CAPTURE_WORKLET = `
class Pcm16Capture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / ${INPUT_RATE};
    this.t = 0;
    this.chunk = new Int16Array(${INPUT_RATE / 10});
    this.length = 0;
  }
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input) return true;
    while (this.t < input.length) {
      const i = Math.floor(this.t);
      const next = i + 1 < input.length ? input[i + 1] : input[i];
      const s = Math.max(-1, Math.min(1, input[i] + (next - input[i]) * (this.t - i)));
      this.chunk[this.length++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.length === this.chunk.length) {
        this.port.postMessage(this.chunk.slice());
        this.length = 0;
      }
      this.t += this.step;
    }
    this.t -= input.length;
    return true;
  }
}
registerProcessor("pcm16-capture", Pcm16Capture);
`;

export interface MicCapture {
  setMuted(muted: boolean): void;
  close(): void;
}

export async function startMicCapture(
  onChunk: (chunk: Int16Array) => void,
): Promise<MicCapture> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const ctx = new AudioContext();
  const url = URL.createObjectURL(
    new Blob([CAPTURE_WORKLET], { type: "text/javascript" }),
  );

  try {
    await ctx.audioWorklet.addModule(url);
  } catch (error) {
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
    throw error;
  } finally {
    URL.revokeObjectURL(url);
  }

  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "pcm16-capture");
  // A silent sink keeps the graph pulled in every browser without echoing the mic.
  const sink = ctx.createGain();
  sink.gain.value = 0;
  source.connect(node).connect(sink).connect(ctx.destination);

  let muted = false;
  node.port.onmessage = (event: MessageEvent<Int16Array>) => {
    if (!muted) onChunk(event.data);
  };

  return {
    setMuted(next) {
      muted = next;
      stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    },
    close() {
      node.port.onmessage = null;
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}

/** Plays the model's 24 kHz chunks back to back and can cut them off when the learner interrupts. */
export class PcmPlayer {
  private ctx = new AudioContext({ sampleRate: OUTPUT_RATE });
  private sources = new Set<AudioBufferSourceNode>();
  private nextStart = 0;

  constructor(private onSpeakingChange: (speaking: boolean) => void) {}

  play(data: string) {
    const samples = base64ToFloat32(data);
    if (samples.length === 0) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();

    const buffer = this.ctx.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);

    this.nextStart = Math.max(this.nextStart, this.ctx.currentTime);
    source.start(this.nextStart);
    this.nextStart += buffer.duration;

    this.sources.add(source);
    if (this.sources.size === 1) this.onSpeakingChange(true);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) this.onSpeakingChange(false);
    };
  }

  interrupt() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
    this.nextStart = 0;
    this.onSpeakingChange(false);
  }

  close() {
    this.interrupt();
    void this.ctx.close();
  }
}
