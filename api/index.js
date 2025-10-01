import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initDb } from '../backend/src/store/db.js';
import financeRoutes from '../backend/src/routes/finance.js';
import servicesRoutes from '../backend/src/routes/services.js';
import ordersRoutes from '../backend/src/routes/os.js';
import ticketsRoutes from '../backend/src/routes/tickets.js';
import settingsRoutes from '../backend/src/routes/settings.js';
import calcRoutes from '../backend/src/routes/calc.js';

// Inicializar banco de dados
await initDb();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/finance', financeRoutes);
app.use('/services', servicesRoutes);
app.use('/os', ordersRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/settings', settingsRoutes);
app.use('/calc', calcRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
