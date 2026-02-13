import type { GameSession, SettleResponse } from '../../../shared/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function settleGame(session: GameSession): Promise<SettleResponse> {
  const res = await fetch(`${API_BASE}/api/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Server error: ${res.status}`);
  }

  return res.json();
}
