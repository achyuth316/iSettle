import { Router, Request, Response } from 'express';
import { validateGameSession } from '../services/validate';
import { computeSettlements } from '../services/settle';

export const settleRouter = Router();

settleRouter.post('/', (req: Request, res: Response) => {
  const result = validateGameSession(req.body);

  if (!result.valid) {
    res.status(400).json({ error: result.error });
    return;
  }

  const response = computeSettlements(result.session);
  res.json(response);
});
