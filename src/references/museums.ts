import { db, type ReferenceRecord } from '../store/db';

// Reference images from three museums' open-access collections. Each search asks only for
// public-domain works (CC0), and each result keeps its credit: the museums ask for the artist,
// title, date and institution, and the viewer shows all four. The launcher's content policy
// admits exactly these hosts; nothing else is fetched. Searches are cached for a month.

const MONTH = 30 * 24 * 60 * 60 * 1000;

async function json(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error(`${new URL(url).host} answered ${response.status}`);
  return response.json();
}

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// The Art Institute of Chicago: one search request, images from its IIIF server at 843 px.
async function artInstitute(query: string, signal?: AbortSignal): Promise<ReferenceRecord[]> {
  const params = new URLSearchParams({
    q: query,
    'query[term][is_public_domain]': 'true',
    fields: 'id,title,artist_title,artist_display,date_display,image_id,is_public_domain',
    limit: '24',
  });
  const body = await json(`https://api.artic.edu/api/v1/artworks/search?${params}`, signal) as { data?: Row[] };
  return (body.data || [])
    .filter((row) => row.is_public_domain === true && text(row.image_id))
    .map((row) => ({
      source: 'aic',
      id: String(row.id),
      title: text(row.title) || 'Untitled',
      creator: text(row.artist_title) || text(row.artist_display).split('\n')[0] || 'Unknown artist',
      date: text(row.date_display),
      image: `https://www.artic.edu/iiif/2/${text(row.image_id)}/full/843,/0/default.jpg`,
      link: `https://www.artic.edu/artworks/${String(row.id)}`,
      licence: 'CC0, public domain. The Art Institute of Chicago',
    }));
}

// The Cleveland Museum of Art: CC0 records with an image.
async function cleveland(query: string, signal?: AbortSignal): Promise<ReferenceRecord[]> {
  const params = new URLSearchParams({ q: query, cc0: '1', has_image: '1', limit: '24' });
  const body = await json(`https://openaccess-api.clevelandart.org/api/artworks/?${params}`, signal) as { data?: Row[] };
  return (body.data || []).flatMap((row) => {
    const images = row.images as { web?: { url?: string } } | undefined;
    const image = text(images?.web?.url);
    if (!image.startsWith('https://openaccess-cdn.clevelandart.org/')) return [];
    const creators = Array.isArray(row.creators) ? (row.creators as Row[]) : [];
    return [{
      source: 'cleveland',
      id: String(row.id),
      title: text(row.title) || 'Untitled',
      creator: text(creators[0]?.description).split('(')[0]?.trim() || 'Unknown artist',
      date: text(row.creation_date),
      image,
      link: text(row.url) || 'https://www.clevelandart.org/art',
      licence: 'CC0, public domain. The Cleveland Museum of Art',
    }];
  });
}

// The Met: a search returns object IDs, and each object is a further request, so take a few.
async function met(query: string, signal?: AbortSignal): Promise<ReferenceRecord[]> {
  const params = new URLSearchParams({ q: query, hasImages: 'true', isPublicDomain: 'true' });
  const body = await json(`https://collectionapi.metmuseum.org/public/collection/v1/search?${params}`, signal) as { objectIDs?: number[] | null };
  const ids = (body.objectIDs || []).slice(0, 8);
  const objects = await Promise.all(ids.map((id) => json(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, signal)
    .catch(() => null) as Promise<Row | null>));
  return objects.flatMap((row) => {
    const image = text(row?.primaryImageSmall);
    if (!row || row.isPublicDomain !== true || !image.startsWith('https://images.metmuseum.org/')) return [];
    return [{
      source: 'met',
      id: String(row.objectID),
      title: text(row.title) || 'Untitled',
      creator: text(row.artistDisplayName) || 'Unknown artist',
      date: text(row.objectDate),
      image,
      link: text(row.objectURL) || 'https://www.metmuseum.org/art/collection',
      licence: 'CC0, public domain. The Metropolitan Museum of Art',
    }];
  });
}

const SOURCES = [
  { id: 'aic', search: artInstitute },
  { id: 'cleveland', search: cleveland },
  { id: 'met', search: met },
] as const;

// Searches the collections in turn and stops at the first with enough results. Failures fall
// through to the next collection; if all fail, the caller shows its built-in references.
export async function searchMuseums(query: string, { minimum = 6, signal }: { minimum?: number; signal?: AbortSignal } = {}): Promise<ReferenceRecord[]> {
  const found: ReferenceRecord[] = [];
  for (const source of SOURCES) {
    const key = `${source.id}:${query.toLowerCase()}`;
    const cached = await db.searches.get(key);
    let results = cached && Date.now() - Date.parse(cached.fetched) < MONTH ? cached.results : null;
    if (!results) {
      try {
        results = await source.search(query, signal);
        await db.searches.put({ key, fetched: new Date().toISOString(), results });
      } catch {
        results = cached?.results || [];
      }
    }
    found.push(...results);
    if (found.length >= minimum) break;
  }
  return found;
}

// Our own renders, drawn for Delineare and free to use. They need no connection.
export const BUILT_IN: ReferenceRecord[] = [
  {
    source: 'builtin', id: 'egg-box-tall', title: 'Egg and box under one lamp', creator: 'Delineare', date: '2026',
    image: './references/egg-box-tall.svg', link: '', licence: 'CC0. Rendered for Delineare',
  },
  {
    source: 'builtin', id: 'egg-box-wide', title: 'Egg and box under one lamp, wide', creator: 'Delineare', date: '2026',
    image: './references/egg-box-wide.svg', link: '', licence: 'CC0. Rendered for Delineare',
  },
];

export function creditLine(reference: ReferenceRecord): string {
  const parts = [reference.title, reference.creator, reference.date].filter(Boolean).join(', ');
  return `${parts}. ${reference.licence}.`;
}
