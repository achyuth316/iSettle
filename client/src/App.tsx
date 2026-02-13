import { useState } from 'react';
import type { Player, SettleResponse } from '../../shared/types';
import { GameSetup } from './components/GameSetup';
import { PlayerEntry } from './components/PlayerEntry';
import { Results } from './components/Results';
import { settleGame } from './utils/api';

type Screen = 'setup' | 'players' | 'results';

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [buyInAmount, setBuyInAmount] = useState(0);
  const [result, setResult] = useState<SettleResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSetup(amount: number) {
    setBuyInAmount(amount);
    setScreen('players');
  }

  async function handleSubmitPlayers(players: Player[]) {
    setError('');
    setLoading(true);
    try {
      const response = await settleGame({ buyInAmount, players });
      setResult(response);
      setScreen('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setBuyInAmount(0);
    setResult(null);
    setError('');
    setScreen('setup');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold text-center">iSettle</h1>
        <p className="text-center text-blue-200 text-sm">Poker Settlement Calculator</p>
      </header>

      <main className="flex-1 px-4 py-8">
        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-500">Calculating...</div>
        )}

        {!loading && screen === 'setup' && <GameSetup onNext={handleSetup} />}
        {!loading && screen === 'players' && (
          <PlayerEntry
            buyInAmount={buyInAmount}
            onSubmit={handleSubmitPlayers}
            onBack={() => setScreen('setup')}
          />
        )}
        {!loading && screen === 'results' && result && (
          <Results result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="text-center text-gray-400 text-xs py-4">
        iSettle v1.0
      </footer>
    </div>
  );
}
