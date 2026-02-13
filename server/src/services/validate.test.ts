import { describe, it, expect } from 'vitest';
import { validateGameSession } from './validate';

describe('validateGameSession', () => {
  const validSession = {
    buyInAmount: 500,
    players: [
      { name: 'Alice', buyInCount: 2, cashInHand: 1500 },
      { name: 'Bob', buyInCount: 1, cashInHand: 200 },
      { name: 'Charlie', buyInCount: 1, cashInHand: 300 },
    ],
  };

  it('accepts a valid session', () => {
    const result = validateGameSession(validSession);
    expect(result.valid).toBe(true);
  });

  it('rejects non-object body', () => {
    const result = validateGameSession('not an object');
    expect(result.valid).toBe(false);
  });

  it('rejects zero buyInAmount', () => {
    const result = validateGameSession({ ...validSession, buyInAmount: 0 });
    expect(result.valid).toBe(false);
  });

  it('rejects negative buyInAmount', () => {
    const result = validateGameSession({ ...validSession, buyInAmount: -100 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-integer buyInAmount', () => {
    const result = validateGameSession({ ...validSession, buyInAmount: 99.5 });
    expect(result.valid).toBe(false);
  });

  it('rejects fewer than 2 players', () => {
    const result = validateGameSession({
      ...validSession,
      players: [{ name: 'Solo', buyInCount: 1, cashInHand: 500 }],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects more than 8 players', () => {
    const players = Array.from({ length: 9 }, (_, i) => ({
      name: `P${i}`,
      buyInCount: 1,
      cashInHand: 100,
    }));
    const result = validateGameSession({ buyInAmount: 100, players });
    expect(result.valid).toBe(false);
  });

  it('rejects empty player name', () => {
    const result = validateGameSession({
      ...validSession,
      players: [
        { name: '', buyInCount: 1, cashInHand: 500 },
        { name: 'Bob', buyInCount: 1, cashInHand: 500 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects duplicate player names (case-insensitive)', () => {
    const result = validateGameSession({
      buyInAmount: 500,
      players: [
        { name: 'Alice', buyInCount: 1, cashInHand: 500 },
        { name: 'alice', buyInCount: 1, cashInHand: 500 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects buyInCount of 0', () => {
    const result = validateGameSession({
      buyInAmount: 500,
      players: [
        { name: 'A', buyInCount: 0, cashInHand: 0 },
        { name: 'B', buyInCount: 1, cashInHand: 500 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects negative cashInHand', () => {
    const result = validateGameSession({
      buyInAmount: 500,
      players: [
        { name: 'A', buyInCount: 1, cashInHand: -100 },
        { name: 'B', buyInCount: 1, cashInHand: 1100 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects unbalanced money', () => {
    const result = validateGameSession({
      buyInAmount: 500,
      players: [
        { name: 'A', buyInCount: 1, cashInHand: 600 },
        { name: 'B', buyInCount: 1, cashInHand: 500 },
      ],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Total money doesn't balance");
    }
  });

  it('trims player names', () => {
    const result = validateGameSession({
      buyInAmount: 500,
      players: [
        { name: '  Alice  ', buyInCount: 1, cashInHand: 700 },
        { name: 'Bob', buyInCount: 1, cashInHand: 300 },
      ],
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.session.players[0].name).toBe('Alice');
    }
  });
});
