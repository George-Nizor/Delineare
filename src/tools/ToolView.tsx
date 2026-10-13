import { lazy, Suspense } from 'react';

const LightTool = lazy(() => import('./LightTool'));
const FormTool = lazy(() => import('./FormTool'));

export type ToolName = 'light' | 'form';

export const TOOLS: { id: ToolName; title: string; summary: string }[] = [
  { id: 'light', title: 'Light on form', summary: 'A lamp you move around simple forms on a table, in greys, with a switch that reduces it to two to five values.' },
  { id: 'form', title: 'Forms in perspective', summary: 'A box or cylinder you turn and look around, with the horizon and vanishing points drawn in. Includes a random-view drill.' },
];

export function isTool(name: string | null | undefined): name is ToolName {
  return name === 'light' || name === 'form';
}

// The 3D tools load three.js only when one is opened, so the rest of the app stays small.
export function ToolView({ tool, compact = false }: { tool: ToolName; compact?: boolean }) {
  return (
    <Suspense fallback={<p className="viewer-message">Setting up the 3D view</p>}>
      {tool === 'light' ? <LightTool compact={compact} /> : <FormTool compact={compact} />}
    </Suspense>
  );
}
