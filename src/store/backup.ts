import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import { db, type Drawing } from './db';

// Export and import everything Delineare stores, as one zip: data.json for the records and one
// JPEG per photo. Import replaces what is here, after checking the file is one of ours.

const FORMAT = 'delineare-backup';
const VERSION = 1;

type StoredDrawing = Omit<Drawing, 'photo' | 'thumb'> & { photo: string | null; thumb: string | null };

async function bytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

export async function exportAll(): Promise<Blob> {
  const [settings, progress, sessions, drawings] = await Promise.all([
    db.settings.toArray(), db.progress.toArray(), db.sessions.toArray(), db.drawings.toArray(),
  ]);
  const files: Zippable = {};
  const stored: StoredDrawing[] = [];
  for (const drawing of drawings) {
    const photo = drawing.photo ? `photos/${drawing.id}.jpg` : null;
    const thumb = drawing.thumb ? `photos/${drawing.id}-thumb.jpg` : null;
    if (photo && drawing.photo) files[photo] = [await bytes(drawing.photo), { level: 0 }];
    if (thumb && drawing.thumb) files[thumb] = [await bytes(drawing.thumb), { level: 0 }];
    stored.push({ ...drawing, photo, thumb });
  }
  const data = { format: FORMAT, version: VERSION, exported: new Date().toISOString(), settings, progress, sessions, drawings: stored };
  files['data.json'] = strToU8(JSON.stringify(data, null, 2));
  return new Blob([zipSync(files)], { type: 'application/zip' });
}

export async function importAll(file: Blob): Promise<{ drawings: number; sessions: number; modules: number }> {
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const raw = entries['data.json'];
  if (!raw) throw new Error('This zip has no data.json, so it is not a Delineare export.');
  const data = JSON.parse(strFromU8(raw));
  if (data?.format !== FORMAT || typeof data.version !== 'number' || data.version > VERSION) {
    throw new Error('This file is not a Delineare export, or it comes from a newer version.');
  }
  const blob = (name: string | null) => {
    const content = name ? entries[name] : undefined;
    return content ? new Blob([content.slice()], { type: 'image/jpeg' }) : null;
  };
  const drawings: Drawing[] = (data.drawings as StoredDrawing[]).map((drawing) => ({ ...drawing, photo: blob(drawing.photo), thumb: blob(drawing.thumb) }));
  await db.transaction('rw', [db.settings, db.progress, db.sessions, db.drawings], async () => {
    await Promise.all([db.settings.clear(), db.progress.clear(), db.sessions.clear(), db.drawings.clear()]);
    await db.settings.bulkPut(data.settings);
    await db.progress.bulkPut(data.progress);
    await db.sessions.bulkPut(data.sessions);
    await db.drawings.bulkPut(drawings);
  });
  return { drawings: drawings.length, sessions: data.sessions.length, modules: data.progress.length };
}
