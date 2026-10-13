// The shape of public/curriculum.json (version 2). curriculum/build_v2.py writes it and
// curriculum/validate.py checks it; docs/CURRICULUM.md explains each field.

export type Tier = 'essential' | 'deepening' | 'stretch' | 'optional';
export type Track = 'core' | 'play' | 'optional';
export type StrandId = 'construct' | 'observe' | 'invent';
export type Coverage = 'strong' | 'partial' | 'thin';
export type Range = [number, number];

export interface Strand {
  id: StrandId;
  title: string;
  summary: string;
}

export interface Phase {
  number: number;
  title: string;
  summary: string;
  module_ids: string[];
}

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  source: 'original';
  sections: LessonSection[];
}

export interface ModuleResource {
  rid: string;
  role: 'core' | 'alternative' | 'supplementary';
  notes: string;
}

export type Timer =
  | { mode: 'single'; minutes: number }
  | { mode: 'ladder'; steps: { count: number; seconds: number }[] };

export type ReferenceKind = 'life' | 'photo' | 'museum' | 'pose-site' | 'tool' | 'prompt' | 'memory' | 'none';

export interface PracticeReference {
  kind: ReferenceKind;
  query: string | null;
  tool: 'light' | 'form' | 'mannequin' | 'grid' | null;
  site: string | null;
  url: string | null;
}

export interface Practice {
  id: string;
  title: string;
  description: string;
  dose: string;
  minutes: number;
  kind: 'exercise' | 'drill' | 'study' | 'play' | 'benchmark';
  timer: Timer;
  reference: PracticeReference;
}

export interface Revisit {
  title: string;
  description: string;
  minutes: number;
  checks: number[];
}

export interface DoneWhen {
  text: string;
  kind: 'judgement' | 'measured' | 'process';
}

export interface SchoolReference {
  institution: string;
  url: string;
  note: string;
}

export interface Module {
  id: string;
  title: string;
  phase: number;
  strand: StrandId;
  tier: Tier;
  track: Track;
  spine: boolean;
  ongoing: boolean;
  summary: string;
  prerequisites: string[];
  est_hours: Range;
  ongoing_hours: Range | null;
  learning_outcomes: string[];
  lesson: Lesson | null;
  resources: ModuleResource[];
  practice: Practice[];
  revisit: Revisit | null;
  done_when: DoneWhen[];
  common_mistakes: string[];
  school_reference?: SchoolReference[] | null;
  free_coverage: Coverage;
  from: string[];
}

export interface Resource {
  id: string;
  title: string;
  provider: string;
  credit?: string;
  url: string;
  format?: string;
  cost: 'free' | 'free-tier' | 'paid';
  free_notes?: string;
  verified: boolean;
  last_checked?: string;
  link_status?: 'ok' | 'blocked' | 'dead' | 'unreachable' | 'error' | string;
  link_note?: string;
  evidence?: 'opened' | 'search-result' | 'unchecked';
}

export interface Provider {
  name?: string;
  provider?: string;
  url?: string;
  [key: string]: unknown;
}

export interface Benchmark {
  id: string;
  after_phase: number;
  title: string;
  check: string;
  pass_signs: string[];
  includes_imagination_set: boolean;
}

export interface LibraryEntry {
  id?: string;
  title: string;
  provider?: string;
  type: string;
  url: string;
  licence: string;
  cost?: string;
  notes?: string;
  free_notes?: string;
  use_for_phases?: number[];
  [key: string]: unknown;
}

export interface TemplateSession {
  day: string;
  minutes: number;
  focus: string;
  kind: 'module' | 'review' | 'gesture' | 'invention' | 'long';
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  hours_per_week: number;
  description: string;
  sessions: TemplateSession[];
}

export interface Meta {
  title: string;
  generated: string;
  module_count: number;
  resource_count: number;
  unverified_resources: number;
  hours_spine: Range;
  hours_all: Range;
  known_gaps: string[];
  research?: string;
  [key: string]: unknown;
}

export interface Curriculum {
  version: 2;
  meta: Meta;
  strands: Strand[];
  phases: Phase[];
  modules: Module[];
  resources: Resource[];
  providers: Provider[];
  syllabi: unknown[];
  library: LibraryEntry[];
  consensus: unknown;
  benchmarks: Benchmark[];
  weekly_templates: WeeklyTemplate[];
  short_session: { minutes: number; description: string };
}
