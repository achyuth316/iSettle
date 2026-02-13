import type { GameSession, Settlement, PlayerSummary, SettleResponse } from '../../../shared/types';

export function computeSettlements(session: GameSession): SettleResponse {
  const { buyInAmount, players } = session;

  const summary: PlayerSummary[] = players.map((p) => {
    const totalIn = buyInAmount * p.buyInCount;
    const net = p.cashInHand - totalIn;
    return { name: p.name, totalIn, cashInHand: p.cashInHand, net };
  });

  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];

  for (const entry of summary) {
    if (entry.net < 0) {
      debtors.push({ name: entry.name, amount: Math.abs(entry.net) });
    } else if (entry.net > 0) {
      creditors.push({ name: entry.name, amount: entry.net });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].amount, creditors[ci].amount);
    settlements.push({
      from: debtors[di].name,
      to: creditors[ci].name,
      amount: transfer,
    });

    debtors[di].amount -= transfer;
    creditors[ci].amount -= transfer;

    if (debtors[di].amount === 0) di++;
    if (creditors[ci].amount === 0) ci++;
  }

  return { settlements, summary };
}

export function formatSettlementsAsText(settlements: Settlement[]): string {
  if (settlements.length === 0) {
    return 'No settlements needed — everyone broke even!';
  }
  return settlements
    .map((s) => `${s.from} pays ₹${s.amount} to ${s.to}`)
    .join('\n');
}
