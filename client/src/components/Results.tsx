import type { SettleResponse } from '../../../shared/types';

interface ResultsProps {
  result: SettleResponse;
  onReset: () => void;
}

export function Results({ result, onReset }: ResultsProps) {
  const { settlements, summary } = result;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Settlement</h2>

      {settlements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">Everyone broke even — no settlements needed!</p>
        </div>
      ) : (
        <ul className="space-y-3 mb-8">
          {settlements.map((s, i) => (
            <li
              key={i}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
            >
              <span>
                <span className="font-semibold text-red-600">{s.from}</span>
                <span className="text-gray-500 mx-2">pays</span>
                <span className="font-bold text-lg">₹{s.amount}</span>
                <span className="text-gray-500 mx-2">to</span>
                <span className="font-semibold text-green-600">{s.to}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <details className="mb-8">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 text-sm font-medium">
          Player Summary
        </summary>
        <table className="w-full mt-3 text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Player</th>
              <th className="py-2 text-right">Paid In</th>
              <th className="py-2 text-right">Cash Out</th>
              <th className="py-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((p) => (
              <tr key={p.name} className="border-b last:border-b-0">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2 text-right">₹{p.totalIn}</td>
                <td className="py-2 text-right">₹{p.cashInHand}</td>
                <td
                  className={`py-2 text-right font-semibold ${
                    p.net > 0 ? 'text-green-600' : p.net < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {p.net > 0 ? '+' : ''}₹{p.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <button
        onClick={onReset}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
