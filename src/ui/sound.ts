// A soft two-note tone when a timer round ends. Quiet on purpose: it should be heard across a desk
// without startling anyone.
let context: AudioContext | null = null;

export function chime(): void {
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    [523.25, 659.25].forEach((frequency, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      const start = now + index * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(start);
      oscillator.stop(start + 1);
    });
  } catch {
    // No audio is fine; the timer still shows the change.
  }
}
