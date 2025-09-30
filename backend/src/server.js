import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { db, initDb } from './store/db.js';
import settingsRouter from './routes/settings.js';
import servicesRouter from './routes/services.js';
import osRouter from './routes/os.js';
import financeRouter from './routes/finance.js';
import calcRouter from './routes/calc.js';
import ticketsRouter from './routes/tickets.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_, res) => res.json({ ok: true, name: 'Sistema TI API' }));

app.use('/api/settings', settingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/os', osRouter);
app.use('/api/finance', financeRouter);
app.use('/api/calc', calcRouter);
app.use('/api/tickets', ticketsRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Erro inesperado' });
});

await initDb();
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));

