/**
 * Maximum round-trip delay for an offset check
 */
const MAX_DELAY_MS = 500;
/**
 * Maximum difference between two offsets for syncing
 */
const MAX_OFFSET_DIFF_MS = 100;
/**
 * Maximum offset checks per sync attempt
 */
const MAX_OFFSET_CHECKS = 5;
/**
 * Minimum interval before resyncing with the server
 */
export const MIN_RESYNC_MS = 5 * 60_000;

let clockOffset = 0;
let lastSynced = 0;

export const now = () => Date.now() + clockOffset;

export class SyncFailed extends Error {
  readonly name = 'SyncFailed';
}

export async function syncTime() {
  if (Date.now() - lastSynced < MIN_RESYNC_MS) return;
  const prevSynced = lastSynced;
  lastSynced = Date.now();
  let minDiff = MAX_OFFSET_DIFF_MS + 1;
  try {
    const offsets = [];
    for (let i = 0; i < MAX_OFFSET_CHECKS; ++i) {
      try {
        const offset = await checkOffset();
        if (Number.isInteger(offset)) offsets.push(offset);
      } catch (error) {
        console.error(error);
        continue;
      }
      if (offsets.length < 2) continue;
      offsets.sort((a, b) => a - b);
      for (const [i, o1] of offsets.slice(0, -1).entries()) {
        const o2 = offsets[i + 1];
        const diff = Math.abs(o1 - o2);
        if (diff < minDiff) {
          minDiff = diff;
          clockOffset = Math.round((o1 + o2) / 2);
        }
      }
      if (minDiff <= MAX_OFFSET_DIFF_MS) return;
    }
    throw new SyncFailed();
  } catch (error) {
    lastSynced = prevSynced;
    throw error;
  }
}

async function checkOffset() {
  const startTime = Date.now();
  const { headers } = await fetch('https://bg1.joelface.com/t');
  const endTime = Date.now();
  const delay = endTime - startTime;
  if (delay > MAX_DELAY_MS) return NaN;
  const serverTime = parseFloat(String(headers?.get('T'))) * 1000;
  const offset = Math.round(serverTime - (startTime + endTime) / 2);
  return offset;
}
