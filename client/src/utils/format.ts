import type { Settlement } from '../../../shared/types';

export function formatSettlementsAsText(settlements: Settlement[]): string {
  if (settlements.length === 0) {
    return 'No settlements needed — everyone broke even!';
  }
  return settlements
    .map((s) => `${s.from} pays ₹${s.amount} to ${s.to}`)
    .join('\n');
}
