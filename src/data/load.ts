import type { Curriculum, Module, Resource } from './types';

// The curriculum with the lookups every screen needs, built once when it loads.
export interface Course {
  data: Curriculum;
  module: Map<string, Module>;
  resource: Map<string, Resource>;
  // Modules that list this one as a prerequisite.
  dependents: Map<string, string[]>;
  // Every module in a valid study order: phase first, then the order the phase lists them.
  order: Module[];
  // Each module's chapter number in that order, starting at 1, as the book's pages use it.
  chapter: Map<string, number>;
}

export function indexCourse(data: Curriculum): Course {
  if (data.version !== 2 || !Array.isArray(data.modules) || !Array.isArray(data.phases)) {
    throw new Error('This curriculum file is not version 2. Rebuild it with npm run curriculum.');
  }
  const module = new Map(data.modules.map((entry) => [entry.id, entry]));
  const resource = new Map(data.resources.map((entry) => [entry.id, entry]));
  const dependents = new Map<string, string[]>();
  for (const entry of data.modules) {
    for (const prerequisite of entry.prerequisites) {
      if (!module.has(prerequisite)) throw new Error(`${entry.id} needs ${prerequisite}, which is not in the curriculum.`);
      dependents.set(prerequisite, [...(dependents.get(prerequisite) || []), entry.id]);
    }
  }
  const order = [...data.phases]
    .sort((a, b) => a.number - b.number)
    .flatMap((phase) => phase.module_ids.map((id) => module.get(id)).filter((entry): entry is Module => Boolean(entry)));
  const chapter = new Map(order.map((entry, index) => [entry.id, index + 1]));
  return { data, module, resource, dependents, order, chapter };
}

export async function loadCourse(url = './curriculum.json'): Promise<Course> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`The curriculum could not be read (${response.status}).`);
  return indexCourse((await response.json()) as Curriculum);
}

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function hoursText([low, high]: [number, number]): string {
  return low === high ? `${low} h` : `${low} to ${high} h`;
}
