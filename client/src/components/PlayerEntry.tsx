import { useState } from 'react';
import type { Player } from '../../../shared/types';

interface PlayerEntryProps {
  buyInAmount: number;
  onSubmit: (players: Player[]) => void;
  onBack: () => void;
}

interface PlayerRow {
  name: string;
  buyInCount: string;
  cashInHand: string;
}

const emptyRow = (): PlayerRow => ({ name: '', buyInCount: '1', cashInHand: '' });

export function PlayerEntry({ buyInAmount, onSubmit, onBack }: PlayerEntryProps) {
  const [rows, setRows] = useState<PlayerRow[]>([emptyRow(), emptyRow()]);
  const [error, setError] = useState('');

  function updateRow(index: number, field: keyof PlayerRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    if (rows.length >= 8) return;
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const players: Player[] = [];
    const names = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = r.name.trim();
      if (!name) {
        setError(`Player ${i + 1}: name is required.`);
        return;
      }
      if (names.has(name.toLowerCase())) {
        setError(`Duplicate name: "${name}".`);
        return;
      }
      names.add(name.toLowerCase());

      const buyInCount = parseInt(r.buyInCount, 10);
      if (!buyInCount || buyInCount < 1) {
        setError(`Player "${name}": buy-in count must be at least 1.`);
        return;
      }

      const cashInHand = parseInt(r.cashInHand, 10);
      if (isNaN(cashInHand) || cashInHand < 0) {
        setError(`Player "${name}": cash in hand must be 0 or more.`);
        return;
      }

      players.push({ name, buyInCount, cashInHand });
    }

    const totalIn = players.reduce((sum, p) => sum + buyInAmount * p.buyInCount, 0);
    const totalOut = players.reduce((sum, p) => sum + p.cashInHand, 0);

    if (totalIn !== totalOut) {
      setError(
        `Money doesn't balance! Total buy-ins: ₹${totalIn}, total cash in hand: ₹${totalOut}. Difference: ₹${Math.abs(totalIn - totalOut)}.`,
      );
      return;
    }

    onSubmit(players);
  }

  const totalIn = rows.reduce((sum, r) => {
    const count = parseInt(r.buyInCount, 10) || 0;
    return sum + buyInAmount * count;
  }, 0);

  const totalOut = rows.reduce((sum, r) => {
    const cash = parseInt(r.cashInHand, 10) || 0;
    return sum + cash;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">Add Players</h2>
      <p className="text-center text-gray-500 mb-6">Buy-in: ₹{buyInAmount} per entry</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              {i === 0 && (
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              )}
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-24">
              {i === 0 && (
                <label className="block text-xs font-medium text-gray-500 mb-1">Buy-ins</label>
              )}
              <input
                type="number"
                min="1"
                step="1"
                value={row.buyInCount}
                onChange={(e) => updateRow(i, 'buyInCount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-32">
              {i === 0 && (
                <label className="block text-xs font-medium text-gray-500 mb-1">Cash in Hand (₹)</label>
              )}
              <input
                type="number"
                min="0"
                step="1"
                value={row.cashInHand}
                onChange={(e) => updateRow(i, 'cashInHand', e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 2}
              className="px-3 py-2 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Remove player"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 8}
            className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            + Add Player
          </button>
          <div className="text-sm text-gray-500">
            Total in: ₹{totalIn} | Total out: ₹{totalOut}
            {totalIn !== totalOut && (
              <span className="text-red-500 ml-2">
                (off by ₹{Math.abs(totalIn - totalOut)})
              </span>
            )}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Settle Up
          </button>
        </div>
      </form>
    </div>
  );
}
