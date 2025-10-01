import { Router } from 'express';
import { all, get, run } from '../store/db.js';
import { FirebaseFinance } from '../store/firebase-db.js';
import { z } from 'zod';

const router = Router();

router.get('/income', async (req, res) => {
  try {
    const data = await FirebaseFinance.incomeList();
    res.json(data);
  } catch (error) {
    console.error('Error getting income:', error);
    res.json(all('SELECT * FROM finance_income ORDER BY date DESC'));
  }
});

router.post('/income', async (req, res) => {
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
  
  try {
    const result = await FirebaseFinance.incomeCreate(data);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating income:', error);
    run(`INSERT INTO finance_income (date,client,gross,discounts,fees,taxes,net,os_id)
      VALUES (@date,@client,@gross,@discounts,@fees,@taxes,@net,@os_id)`, data);
    res.status(201).json(get('SELECT * FROM finance_income WHERE id = last_insert_rowid()'));
  }
});

router.get('/expense', async (req, res) => {
  try {
    const data = await FirebaseFinance.expenseList();
    res.json(data);
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.json(all('SELECT * FROM finance_expense ORDER BY date DESC'));
  }
});

router.post('/expense', async (req, res) => {
  const schema = z.object({
    date: z.string(),
    category: z.string(),
    description: z.string().optional().default(''),
    amount: z.number().min(0),
    fixed: z.boolean().optional().default(false)
  });
  const data = schema.parse(req.body);
  
  try {
    const result = await FirebaseFinance.expenseCreate(data);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating expense:', error);
    run(`INSERT INTO finance_expense (date,category,description,amount,fixed)
      VALUES (@date,@category,@description,@amount,@fixed)`, { ...data, fixed: data.fixed ? 1 : 0 });
    res.status(201).json(get('SELECT * FROM finance_expense WHERE id = last_insert_rowid()'));
  }
});

router.put('/expense/:id', async (req, res) => {
  const schema = z.object({
    date: z.string(),
    category: z.string(),
    description: z.string().optional().default(''),
    amount: z.number().min(0),
    fixed: z.boolean().optional().default(false)
  });
  const data = schema.parse(req.body);
  const id = parseInt(req.params.id);
  
  try {
    const result = await FirebaseFinance.expenseUpdate(id, data);
    res.json(result);
  } catch (error) {
    console.error('Error updating expense:', error);
    run(`UPDATE finance_expense 
      SET date=@date, category=@category, description=@description, amount=@amount, fixed=@fixed 
      WHERE id=@id`, { ...data, fixed: data.fixed ? 1 : 0, id });
    res.json(get('SELECT * FROM finance_expense WHERE id = @id', { id }));
  }
});

router.delete('/expense/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    await FirebaseFinance.expenseDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    run('DELETE FROM finance_expense WHERE id = @id', { id });
    res.status(204).send();
  }
});

router.get('/dashboard', async (req, res) => {
  const month = req.query.month; // YYYY-MM
  
  try {
    const data = await FirebaseFinance.dashboard(month);
    res.json(data);
  } catch (error) {
    console.error('Error getting dashboard:', error);
    // Fallback to SQLite
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
  }
});

export default router;


