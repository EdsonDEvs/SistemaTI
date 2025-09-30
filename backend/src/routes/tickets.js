import { Router } from 'express';
import { all, get, run } from '../store/db.js';
import { hasFirebase, getFirestore } from '../store/firebase.js';
import { z } from 'zod';

const router = Router();

const TicketSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().default(''),
  client: z.string().optional().default(''),
  device: z.string().optional().default(''),
  status: z.enum(['Aberto','Em andamento','Pausado','Concluído']).optional().default('Aberto'),
  priority: z.enum(['Baixa','Média','Alta','Urgente']).optional().default('Média'),
  due_date: z.string().optional().default('')
});

router.get('/', async (req, res) => {
  if (hasFirebase()) {
    const db = getFirestore();
    const snap = await db.collection('tickets').orderBy('priority').orderBy('created_at','desc').get();
    const out = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(out);
  }
  const rows = all(`SELECT * FROM tickets ORDER BY 
    CASE priority WHEN 'Urgente' THEN 1 WHEN 'Alta' THEN 2 WHEN 'Média' THEN 3 ELSE 4 END, 
    created_at DESC`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const data = TicketSchema.parse(req.body);
  if (hasFirebase()) {
    const db = getFirestore();
    const payload = { ...data, created_at: new Date().toISOString() };
    const ref = await db.collection('tickets').add(payload);
    return res.status(201).json({ id: ref.id, ...payload });
  }
  run(`INSERT INTO tickets (title,description,client,device,status,priority,due_date) 
    VALUES (@title,@description,@client,@device,@status,@priority,@due_date)`, data);
  const row = get('SELECT * FROM tickets WHERE id = last_insert_rowid()');
  res.status(201).json(row);
});

router.put('/:id', async (req, res) => {
  const idParam = req.params.id;
  const schema = TicketSchema.partial();
  const data = schema.parse(req.body);
  if (hasFirebase()) {
    const db = getFirestore();
    const ref = db.collection('tickets').doc(String(idParam));
    await ref.set(data, { merge: true });
    const snap = await ref.get();
    return res.json({ id: snap.id, ...snap.data() });
  }
  const id = Number(idParam);
  const cur = get('SELECT * FROM tickets WHERE id = @id', { id });
  if (!cur) return res.status(404).json({ error: 'Chamado não encontrado' });
  const merged = { ...cur, ...data };
  run(`UPDATE tickets SET title=@title,description=@description,client=@client,device=@device,
    status=@status,priority=@priority,due_date=@due_date WHERE id=@id`, { ...merged, id });
  res.json(get('SELECT * FROM tickets WHERE id=@id',{ id }));
});

router.delete('/:id', async (req, res) => {
  if (hasFirebase()) {
    const db = getFirestore();
    await db.collection('tickets').doc(String(req.params.id)).delete();
    return res.json({ ok: true });
  }
  const id = Number(req.params.id);
  run('DELETE FROM tickets WHERE id=@id', { id });
  res.json({ ok: true });
});

export default router;


