import { describe, it, expect } from 'vitest';
import { computeSettlements, formatSettlementsAsText } from './settle';
import type { GameSession } from '../../../shared/types';

describe('computeSettlements', () => {
  it('settles a basic 3-player game', () => {
    const session: GameSession = {
      buyInAmount: 500,
      players: [
        { name: 'Alice', buyInCount: 2, cashInHand: 1500 },
        { name: 'Bob', buyInCount: 1, cashInHand: 200 },
        { name: 'Charlie', buyInCount: 1, cashInHand: 300 },
      ],
    };
    const result = computeSettlements(session);

    expect(result.summary).toHaveLength(3);
    expect(result.summary.find((s) => s.name === 'Alice')?.net).toBe(500);
    expect(result.summary.find((s) => s.name === 'Bob')?.net).toBe(-300);
    expect(result.summary.find((s) => s.name === 'Charlie')?.net).toBe(-200);

    const totalPaid = result.settlements.reduce((sum, s) => sum + s.amount, 0);
    expect(totalPaid).toBe(500);
  });

  it('handles 2 players', () => {
    const session: GameSession = {
      buyInAmount: 1000,
      players: [
        { name: 'A', buyInCount: 1, cashInHand: 1500 },
        { name: 'B', buyInCount: 1, cashInHand: 500 },
      ],
    };
    const result = computeSettlements(session);

    expect(result.settlements).toHaveLength(1);
    expect(result.settlements[0]).toEqual({ from: 'B', to: 'A', amount: 500 });
  });

  it('handles everyone breaking even', () => {
    const session: GameSession = {
      buyInAmount: 500,
      players: [
        { name: 'A', buyInCount: 1, cashInHand: 500 },
        { name: 'B', buyInCount: 1, cashInHand: 500 },
        { name: 'C', buyInCount: 1, cashInHand: 500 },
      ],
    };
    const result = computeSettlements(session);
    expect(result.settlements).toHaveLength(0);
  });

  it('handles a single winner and multiple losers', () => {
    const session: GameSession = {
      buyInAmount: 500,
      players: [
        { name: 'Winner', buyInCount: 1, cashInHand: 1500 },
        { name: 'L1', buyInCount: 1, cashInHand: 200 },
        { name: 'L2', buyInCount: 1, cashInHand: 100 },
        { name: 'L3', buyInCount: 1, cashInHand: 200 },
      ],
    };
    const result = computeSettlements(session);

    const totalToWinner = result.settlements
      .filter((s) => s.to === 'Winner')
      .reduce((sum, s) => sum + s.amount, 0);
    expect(totalToWinner).toBe(1000);
  });

  it('handles a single loser and multiple winners', () => {
    const session: GameSession = {
      buyInAmount: 500,
      players: [
        { name: 'Loser', buyInCount: 3, cashInHand: 0 },
        { name: 'W1', buyInCount: 1, cashInHand: 1300 },
        { name: 'W2', buyInCount: 1, cashInHand: 1200 },
      ],
    };
    const result = computeSettlements(session);

    const totalFromLoser = result.settlements
      .filter((s) => s.from === 'Loser')
      .reduce((sum, s) => sum + s.amount, 0);
    expect(totalFromLoser).toBe(1500);
  });

  it('handles 8 players', () => {
    const session: GameSession = {
      buyInAmount: 100,
      players: [
        { name: 'P1', buyInCount: 1, cashInHand: 200 },
        { name: 'P2', buyInCount: 1, cashInHand: 150 },
        { name: 'P3', buyInCount: 1, cashInHand: 50 },
        { name: 'P4', buyInCount: 1, cashInHand: 0 },
        { name: 'P5', buyInCount: 1, cashInHand: 100 },
        { name: 'P6', buyInCount: 1, cashInHand: 100 },
        { name: 'P7', buyInCount: 1, cashInHand: 200 },
        { name: 'P8', buyInCount: 1, cashInHand: 0 },
      ],
    };
    const result = computeSettlements(session);

    const netSum = result.summary.reduce((sum, s) => sum + s.net, 0);
    expect(netSum).toBe(0);

    expect(result.settlements.length).toBeLessThanOrEqual(7);
  });

  it('handles multiple buy-ins correctly', () => {
    const session: GameSession = {
      buyInAmount: 500,
      players: [
        { name: 'A', buyInCount: 3, cashInHand: 2000 },
        { name: 'B', buyInCount: 2, cashInHand: 500 },
      ],
    };
    const result = computeSettlements(session);

    expect(result.summary.find((s) => s.name === 'A')?.totalIn).toBe(1500);
    expect(result.summary.find((s) => s.name === 'A')?.net).toBe(500);
    expect(result.summary.find((s) => s.name === 'B')?.totalIn).toBe(1000);
    expect(result.summary.find((s) => s.name === 'B')?.net).toBe(-500);

    expect(result.settlements).toEqual([{ from: 'B', to: 'A', amount: 500 }]);
  });
});

describe('formatSettlementsAsText', () => {
  it('formats settlements as readable text', () => {
    const text = formatSettlementsAsText([
      { from: 'Bob', to: 'Alice', amount: 300 },
      { from: 'Charlie', to: 'Alice', amount: 200 },
    ]);
    expect(text).toBe('Bob pays ₹300 to Alice\nCharlie pays ₹200 to Alice');
  });

  it('returns a message when no settlements needed', () => {
    const text = formatSettlementsAsText([]);
    expect(text).toContain('No settlements needed');
  });
});
