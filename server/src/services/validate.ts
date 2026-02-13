import type { GameSession } from '../../../shared/types';

export function validateGameSession(body: unknown): { valid: true; session: GameSession } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.buyInAmount !== 'number' || obj.buyInAmount <= 0 || !Number.isInteger(obj.buyInAmount)) {
    return { valid: false, error: 'buyInAmount must be a positive integer.' };
  }

  if (!Array.isArray(obj.players)) {
    return { valid: false, error: 'players must be an array.' };
  }

  if (obj.players.length < 2 || obj.players.length > 8) {
    return { valid: false, error: 'players must have between 2 and 8 entries.' };
  }

  const names = new Set<string>();

  for (let i = 0; i < obj.players.length; i++) {
    const p = obj.players[i] as Record<string, unknown>;

    if (typeof p.name !== 'string' || p.name.trim().length === 0) {
      return { valid: false, error: `Player ${i + 1}: name must be a non-empty string.` };
    }

    const normalizedName = p.name.trim().toLowerCase();
    if (names.has(normalizedName)) {
      return { valid: false, error: `Duplicate player name: "${p.name.trim()}".` };
    }
    names.add(normalizedName);

    if (typeof p.buyInCount !== 'number' || p.buyInCount < 1 || !Number.isInteger(p.buyInCount)) {
      return { valid: false, error: `Player "${p.name}": buyInCount must be a positive integer.` };
    }

    if (typeof p.cashInHand !== 'number' || p.cashInHand < 0 || !Number.isInteger(p.cashInHand)) {
      return { valid: false, error: `Player "${p.name}": cashInHand must be a non-negative integer.` };
    }
  }

  const buyInAmount = obj.buyInAmount as number;
  const players = (obj.players as Array<Record<string, unknown>>).map((p) => ({
    name: (p.name as string).trim(),
    buyInCount: p.buyInCount as number,
    cashInHand: p.cashInHand as number,
  }));

  const totalIn = players.reduce((sum, p) => sum + buyInAmount * p.buyInCount, 0);
  const totalOut = players.reduce((sum, p) => sum + p.cashInHand, 0);

  if (totalIn !== totalOut) {
    return {
      valid: false,
      error: `Total money doesn't balance. Total buy-ins: ₹${totalIn}, total cash in hand: ₹${totalOut}. Difference: ₹${Math.abs(totalIn - totalOut)}.`,
    };
  }

  return { valid: true, session: { buyInAmount, players } };
}
