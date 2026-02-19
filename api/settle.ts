import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateGameSession } from '../server/src/services/validate';
import { computeSettlements } from '../server/src/services/settle';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = validateGameSession(req.body);

  if (!result.valid) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json(computeSettlements(result.session));
}
