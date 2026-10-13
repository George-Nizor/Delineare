import { useEffect, useMemo, useRef, useState } from 'react';
import type { Timer } from '../data/types';

export interface TimerState {
  elapsed: number; // seconds
  total: number;
  left: number;
  // For a ladder: which pose, of how many, and the seconds left on it.
  pose: number;
  poses: number;
  poseLeft: number;
  poseLength: number;
  done: boolean;
}

// Wall-clock based, so a tab that sleeps or a slow frame never loses time.
export function useTimer(timer: Timer, running: boolean, resetKey: unknown): TimerState {
  const poses = useMemo(() => (timer.mode === 'ladder'
    ? timer.steps.flatMap((step) => Array.from({ length: step.count }, () => step.seconds))
    : [timer.minutes * 60]), [timer]);
  const total = poses.reduce((sum, seconds) => sum + seconds, 0);
  const [elapsed, setElapsed] = useState(0);
  const anchor = useRef<{ at: number; base: number } | null>(null);

  useEffect(() => {
    setElapsed(0);
    anchor.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      anchor.current = null;
      return;
    }
    anchor.current = { at: performance.now(), base: elapsed };
    const tick = window.setInterval(() => {
      if (!anchor.current) return;
      setElapsed(Math.min(total, anchor.current.base + (performance.now() - anchor.current.at) / 1000));
    }, 200);
    return () => window.clearInterval(tick);
    // elapsed is read once when the clock starts, on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, total, resetKey]);

  let pose = 0;
  let start = 0;
  while (pose < poses.length - 1 && elapsed >= start + poses[pose]!) {
    start += poses[pose]!;
    pose += 1;
  }
  const poseLength = poses[pose] || 0;
  return {
    elapsed, total, left: Math.max(0, total - elapsed), pose, poses: poses.length,
    poseLeft: Math.max(0, start + poseLength - elapsed), poseLength, done: elapsed >= total,
  };
}

export function clock(seconds: number): string {
  const whole = Math.ceil(seconds);
  const minutes = Math.floor(whole / 60);
  return `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

// A short, quiet tone for a pose change or the end of a part.
export function chime(high = false): void {
  try {
    const Context = window.AudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = high ? 880 : 587.33;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
    oscillator.onended = () => { void context.close(); };
  } catch {
    // No sound is fine.
  }
}

// Keeps a phone's screen on while a session runs, where the browser allows it.
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = () => navigator.wakeLock.request('screen').then((sentinel) => {
      if (cancelled) void sentinel.release();
      else lock = sentinel;
    }).catch(() => {});
    void request();
    const again = () => { if (document.visibilityState === 'visible') void request(); };
    document.addEventListener('visibilitychange', again);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', again);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
