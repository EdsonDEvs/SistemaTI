import { Router } from 'express';
import { all, get, run } from '../store/db.js';
import { z } from 'zod';

const router = Router();

router.get('/income', (req, res) => {
  res.json(all('SELECT * FROM finance_income ORDER BY date DESC'));
});

router.post('/income', (req, res) => {
  const schema = z.object({
    date: z.string(),
    client: z.string().optional().default(''),
    gross: z.number().min(0),
    discounts: z.number().min(0).default(0),
    fees: z.number().min(0).default(0),
    taxes: z.number().min(0).default(0),
    net: z.number().min(0),
    os_id: z.number().optional()
  });
  const data = schema.parse(req.body);
  run(`INSERT INTO finance_income (date,client,gross,discounts,fees,taxes,net,os_id)
    VALUES (@date,@client,@gross,@discounts,@fees,@taxes,@net,@os_id)`, data);
  res.status(201).json(get('SELECT * FROM finance_income WHERE id = last_insert_rowid()'));
});

router.get('/expense', (req, res) => {
  res.json(all('SELECT * FROM finance_expense ORDER BY date DESC'));
});

router.post('/expense', (req, res) => {
  const schema = z.object({
    date: z.string(),
    category: z.string(),
    description: z.string().optional().default(''),
    amount: z.number().min(0),
    fixed: z.boolean().optional().default(false)
  });
  const data = schema.parse(req.body);
  run(`INSERT INTO finance_expense (date,category,description,amount,fixed)
    VALUES (@date,@category,@description,@amount,@fixed)`, { ...data, fixed: data.fixed ? 1 : 0 });
  res.status(201).json(get('SELECT * FROM finance_expense WHERE id = last_insert_rowid()'));
});

router.get('/dashboard', (req, res) => {
  const month = req.query.month; // YYYY-MM
  const [y, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  const start = `${y}-${String(m).padStart(2,'0')}-01`;
  const end = `${y}-${String(m).padStart(2,'0')}-31`;

  const incomes = all('SELECT * FROM finance_income WHERE date BETWEEN @start AND @end', { start, end });
  const expenses = all('SELECT * FROM finance_expense WHERE date BETWEEN @start AND @end', { start, end });
  const revenue = incomes.reduce((s, i) => s + i.net, 0);
  const cost = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - cost;
  const avgTicket = incomes.length ? revenue / incomes.length : 0;

  res.json({ revenue, cost, profit, avgTicket, incomes, expenses });
});

export default router;


