import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { SettleResponse } from '../../../shared/types';

interface ResultsProps {
  result: SettleResponse;
  onReset: () => void;
}

async function captureScreenshot(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#f9fafb',
    scale: 2,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create image'))),
      'image/png'
    );
  });
}

async function shareScreenshot(blob: Blob): Promise<void> {
  const file = new File([blob], 'isettle-settlement.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'iSettle — Poker Settlement',
      files: [file],
    });
  } else {
    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isettle-settlement.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function Results({ result, onReset }: ResultsProps) {
  const { settlements, summary } = result;
  const captureRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const blob = await captureScreenshot(captureRef.current);
      await shareScreenshot(blob);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div ref={captureRef} className="p-4">
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

        <details className="mb-8" open>
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
      </div>

      <div className="flex gap-3 px-4">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {sharing ? 'Capturing...' : 'Share via WhatsApp'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
