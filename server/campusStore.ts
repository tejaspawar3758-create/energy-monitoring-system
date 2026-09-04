import fs from 'fs/promises';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { mergeSharedState, type SharedCampusState } from '../src/sync/mergeState.ts';

const STATE_ID = 'campus';
const LOCAL_STATE_FILE = process.env.VERCEL
  ? path.join('/tmp', 'campus-state.json')
  : path.join(process.cwd(), 'data', 'campus-state.json');

export type StorageKind = 'neon' | 'file';

export function storageKind(): StorageKind {
  return process.env.DATABASE_URL ? 'neon' : 'file';
}

function emptyState(): SharedCampusState {
  return {
    version: 0,
    users: [],
    blocks: [],
    meters: [],
    readings: [],
    tariff: undefined as unknown as SharedCampusState['tariff'],
    msebBlocks: [],
    msebReadings: [],
    msebTariffs: {},
    deletedReadingIds: [],
    deletedMsebReadingIds: [],
  };
}

async function ensureNeonTable() {
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`
    CREATE TABLE IF NOT EXISTS campus_state (
      id TEXT PRIMARY KEY,
      version INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

async function loadState(): Promise<SharedCampusState | null> {
  if (storageKind() === 'neon') {
    const sql = await ensureNeonTable();
    const rows = (await sql`
      SELECT version, payload FROM campus_state WHERE id = ${STATE_ID} LIMIT 1
    `) as Array<{ version: number; payload: string }>;
    if (!rows.length) return null;
    const parsed = JSON.parse(rows[0].payload) as SharedCampusState;
    parsed.version = Number(rows[0].version) || parsed.version || 0;
    return parsed;
  }

  try {
    const raw = await fs.readFile(LOCAL_STATE_FILE, 'utf8');
    return JSON.parse(raw) as SharedCampusState;
  } catch {
    return null;
  }
}

async function persistState(state: SharedCampusState): Promise<void> {
  const payload = JSON.stringify(state);

  if (storageKind() === 'neon') {
    const sql = await ensureNeonTable();
    await sql`
      INSERT INTO campus_state (id, version, payload, updated_at)
      VALUES (${STATE_ID}, ${state.version}, ${payload}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        version = EXCLUDED.version,
        payload = EXCLUDED.payload,
        updated_at = NOW()
    `;
    return;
  }

  await fs.mkdir(path.dirname(LOCAL_STATE_FILE), { recursive: true });
  const tmp = `${LOCAL_STATE_FILE}.tmp`;
  await fs.writeFile(tmp, payload, 'utf8');
  await fs.rename(tmp, LOCAL_STATE_FILE);
}

export async function getCampusState(): Promise<SharedCampusState> {
  return (await loadState()) || emptyState();
}

export async function putCampusState(
  incoming: Partial<SharedCampusState>
): Promise<SharedCampusState> {
  const current = await loadState();
  const next = mergeSharedState(current, incoming);
  await persistState(next);
  return next;
}

export type StateApiResult = {
  status: number;
  body: SharedCampusState | { error: string; storage: StorageKind };
};

export async function handleCampusStateRequest(
  method: string,
  incoming?: Partial<SharedCampusState>
): Promise<StateApiResult> {
  try {
    if (method === 'GET') {
      return { status: 200, body: await getCampusState() };
    }
    if (method === 'PUT' || method === 'POST') {
      return { status: 200, body: await putCampusState(incoming || {}) };
    }
    return {
      status: 405,
      body: { error: 'Method not allowed', storage: storageKind() },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to access campus store';
    return { status: 500, body: { error: message, storage: storageKind() } };
  }
}
