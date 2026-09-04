import type { SharedCampusState } from './mergeState';
import { applyTombstones, mergeById } from './mergeState';

export type { SharedCampusState } from './mergeState';
export { applyTombstones, mergeById, mergeSharedState } from './mergeState';

function stateUrl(): string {
  return '/api/state';
}

export async function fetchSharedState(): Promise<SharedCampusState | null> {
  try {
    const res = await fetch(stateUrl(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    if (data.error) return null;
    if (data.version == null && !data.readings && !data.users) return null;
    return data as SharedCampusState;
  } catch {
    return null;
  }
}

export async function saveSharedState(
  payload: Omit<SharedCampusState, 'version'> & { version?: number }
): Promise<SharedCampusState | null> {
  try {
    const res = await fetch(stateUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as SharedCampusState;
  } catch {
    return null;
  }
}

export function overlaySharedState(
  local: SharedCampusState,
  remote: SharedCampusState
): SharedCampusState {
  const deletedReadingIds = Array.from(
    new Set([...(local.deletedReadingIds || []), ...(remote.deletedReadingIds || [])])
  );
  const deletedMsebReadingIds = Array.from(
    new Set([...(local.deletedMsebReadingIds || []), ...(remote.deletedMsebReadingIds || [])])
  );
  return {
    version: Math.max(local.version || 0, remote.version || 0),
    users: mergeById(local.users, remote.users),
    blocks: mergeById(local.blocks, remote.blocks),
    meters: mergeById(local.meters, remote.meters),
    readings: applyTombstones(mergeById(local.readings, remote.readings), deletedReadingIds),
    tariff: remote.tariff || local.tariff,
    msebBlocks: mergeById(local.msebBlocks, remote.msebBlocks),
    msebReadings: applyTombstones(mergeById(local.msebReadings, remote.msebReadings), deletedMsebReadingIds),
    msebTariffs: { ...(local.msebTariffs || {}), ...(remote.msebTariffs || {}) },
    deletedReadingIds,
    deletedMsebReadingIds,
  };
}
