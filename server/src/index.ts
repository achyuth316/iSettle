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

app.listen(PORT, () => {
  console.log(`iSettle server running on port ${PORT}`);
});

export { app };
