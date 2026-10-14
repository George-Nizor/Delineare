import { useEffect, useState } from 'react';
import { Mark } from './Mark';

const WORD = 'Delineare';

// The opening animation: the pencil sweeps in, a line draws itself under the name, and the name
// rises letter by letter. It plays once each time the app opens, and a click or key skips it.
export function Splash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [minimumPassed, setMinimumPassed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced');

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumPassed(true), reduced ? 500 : 1900);
    const skip = () => setMinimumPassed(true);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [reduced]);

  useEffect(() => {
    if (minimumPassed && ready) setLeaving(true);
  }, [minimumPassed, ready]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(onDone, reduced ? 200 : 520);
    return () => window.clearTimeout(timer);
  }, [leaving, onDone, reduced]);

  return (
    <div className={`splash ${leaving ? 'leaving' : ''}`} role="status" aria-label="Delineare is opening">
      <div className="splash-inner">
        <div className="splash-mark"><Mark size={96} /></div>
        <div className="splash-word" aria-hidden="true">
          {[...WORD].map((letter, i) => <span key={i} style={{ animationDelay: `${520 + i * 45}ms` }}>{letter}</span>)}
        </div>
        <svg className="splash-line" viewBox="0 0 320 16" aria-hidden="true" preserveAspectRatio="none">
          <path d="M4 10 C 70 4, 150 13, 222 7 S 300 6, 316 8" />
        </svg>
      </div>
    </div>
  );
}
