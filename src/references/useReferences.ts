import { useEffect, useState } from 'react';
import type { PracticeReference } from '../data/types';
import type { ReferenceRecord } from '../store/db';
import { BUILT_IN, searchMuseums } from './museums';

export interface References {
  items: ReferenceRecord[];
  loading: boolean;
  // True when the museums could not be reached and the built-in renders stand in.
  offline: boolean;
}

// What to look at for a step. Museum and photo steps search the open-access collections. Light and
// form steps are drawn live by the 3D tools; steps for tools not built yet (the mannequin, grids)
// show the built-in renders. The rest (life, memory, prompts, pose sites) show no image.
export function useReferences(reference: PracticeReference | null, extraQuery = ''): References {
  const kind = reference?.kind || 'none';
  const query = (reference?.query || extraQuery || '').trim();
  const wantsSearch = (kind === 'museum' || kind === 'photo') && Boolean(query);
  // The light and form tools draw the reference themselves; other tools are not built yet, so
  // their steps show the built-in renders.
  const toolStandsIn = kind === 'tool' && !['light', 'form'].includes(reference?.tool || '');
  const [state, setState] = useState<References>({ items: toolStandsIn ? BUILT_IN : [], loading: wantsSearch, offline: false });

  useEffect(() => {
    if (!wantsSearch) {
      setState({ items: toolStandsIn || ((kind === 'museum' || kind === 'photo') && !query) ? BUILT_IN : [], loading: false, offline: false });
      return;
    }
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true }));
    searchMuseums(query, { signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        setState(items.length ? { items, loading: false, offline: false } : { items: BUILT_IN, loading: false, offline: true });
      })
      .catch(() => { if (!controller.signal.aborted) setState({ items: BUILT_IN, loading: false, offline: true }); });
    return () => controller.abort();
  }, [kind, query, wantsSearch, toolStandsIn]);

  return state;
}
