import { useCallback, useEffect, useRef, useState } from 'react';
import type { Round } from '../content/types';

export type TimerPhase = 'ready' | 'running' | 'paused' | 'finished';

export interface TimerState {
  phase: TimerPhase;
  round: number;
  remaining: number; // seconds left in the current round
  start: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  skipRound: () => void;
}

// Counts down through the rounds by the clock rather than by ticks, so a busy tab never drifts.
export function useTimer(rounds: readonly Round[], onRoundEnd?: (finished: boolean) => void): TimerState {
  const [phase, setPhase] = useState<TimerPhase>('ready');
  const [round, setRound] = useState(0);
  const [remaining, setRemaining] = useState(rounds[0]?.seconds ?? 0);
  const deadline = useRef(0);
  const callback = useRef(onRoundEnd);
  callback.current = onRoundEnd;

  const begin = useCallback((index: number, seconds: number) => {
    setRound(index);
    setRemaining(seconds);
    deadline.current = Date.now() + seconds * 1000;
    setPhase('running');
  }, []);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left > 0) return;
      const next = round + 1;
      if (next < rounds.length) {
        callback.current?.(false);
        begin(next, rounds[next]!.seconds);
      } else {
        callback.current?.(true);
        setPhase('finished');
      }
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [phase, round, rounds, begin]);

  return {
    phase,
    round,
    remaining,
    start: () => begin(0, rounds[0]?.seconds ?? 0),
    pause: () => {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      setPhase('paused');
    },
    resume: () => {
      deadline.current = Date.now() + remaining * 1000;
      setPhase('running');
    },
    finish: () => setPhase('finished'),
    skipRound: () => {
      const next = round + 1;
      if (next < rounds.length) begin(next, rounds[next]!.seconds);
      else setPhase('finished');
    },
  };
}

export function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
