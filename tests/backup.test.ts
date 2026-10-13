import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../src/store/db';
import { exportAll, importAll } from '../src/store/backup';

describe('export and import', () => {
  beforeEach(async () => {
    await Promise.all([db.settings.clear(), db.progress.clear(), db.sessions.clear(), db.drawings.clear()]);
  });

  it('round-trips progress, sessions and photographed pages', async () => {
    const photo = new Blob([new Uint8Array([255, 216, 255, 1, 2, 3])], { type: 'image/jpeg' });
    await db.settings.put({ key: 'template', value: 'six' });
    await db.progress.put({ moduleId: 'lines', started: '2026-10-13', lastPractised: '2026-10-13', firstPass: '2026-10-13', passed: null, revisitDue: '2026-10-15', revisitDays: 2, weak: false });
    await db.sessions.add({ date: '2026-10-13T09:00:00Z', plannedMinutes: 30, spentSeconds: 1700, steps: [], short: false });
    await db.drawings.add({ date: '2026-10-13T09:30:00Z', moduleId: 'lines', practiceId: 'lines.p1', sessionId: null, revisit: false, note: 'Lines wobble at the end',
      checks: { 0: 'yes', 1: 'partly' }, photo, thumb: photo, width: 2000, height: 1500, reference: null });

    const zip = await exportAll();
    await Promise.all([db.settings.clear(), db.progress.clear(), db.sessions.clear(), db.drawings.clear()]);
    const counts = await importAll(zip);

    expect(counts).toEqual({ drawings: 1, sessions: 1, modules: 1 });
    const [drawing] = await db.drawings.toArray();
    expect(drawing?.note).toBe('Lines wobble at the end');
    expect(drawing?.checks).toEqual({ 0: 'yes', 1: 'partly' });
    expect(new Uint8Array(await drawing!.photo!.arrayBuffer())).toEqual(new Uint8Array([255, 216, 255, 1, 2, 3]));
    expect((await db.progress.get('lines'))?.revisitDue).toBe('2026-10-15');
    expect((await db.settings.get('template'))?.value).toBe('six');
  });

  it('refuses a zip that is not a Delineare export', async () => {
    const { zipSync, strToU8 } = await import('fflate');
    const other = new Blob([zipSync({ 'data.json': strToU8(JSON.stringify({ format: 'something-else' })) })]);
    await expect(importAll(other)).rejects.toThrow(/not a Delineare export/);
  });
});
