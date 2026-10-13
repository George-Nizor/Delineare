import type { ReactNode } from 'react';

export interface ToolHandle<T> {
  update: (controls: T) => void;
  dispose: () => void;
}

// SVG filters that reduce an image to 2 to 5 grey values, applied to a tool's canvas with CSS. A
// value study is about big shapes of light and dark, and this shows them the way squinting does.
export function Posterise() {
  const table = (count: number) => Array.from({ length: count }, (_, index) => (index / (count - 1)).toFixed(3)).join(' ');
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      {[2, 3, 4, 5].map((count) => (
        <filter key={count} id={`posterise-${count}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={table(count)} />
            <feFuncG type="discrete" tableValues={table(count)} />
            <feFuncB type="discrete" tableValues={table(count)} />
          </feComponentTransfer>
        </filter>
      ))}
    </svg>
  );
}

export function ToolBar({ compact, children }: { compact: boolean; children: ReactNode }) {
  return <div className={`tool-bar${compact ? ' compact' : ''}`} role="group" aria-label="Tool controls">{children}</div>;
}
