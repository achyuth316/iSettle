import express from 'express';
import cors from 'cors';
import { settleRouter } from './routes/settle';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/settle', settleRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`iSettle server running on http://0.0.0.0:${PORT}`);
});

export { app };
