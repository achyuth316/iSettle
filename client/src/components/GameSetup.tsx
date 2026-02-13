import { useState } from 'react';

interface GameSetupProps {
  onNext: (buyInAmount: number) => void;
}

export function GameSetup({ onNext }: GameSetupProps) {
  const [buyInAmount, setBuyInAmount] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(buyInAmount, 10);
    if (!amount || amount <= 0) {
      setError('Enter a valid buy-in amount (positive whole number).');
      return;
    }
    setError('');
    onNext(amount);
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Game Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="buyInAmount" className="block text-sm font-medium mb-1">
            Buy-in Amount (₹)
          </label>
          <input
            id="buyInAmount"
            type="number"
            min="1"
            step="1"
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Next — Add Players
        </button>
      </form>
    </div>
  );
}
