import { Router } from 'express';
import { all, get, run } from '../store/db.js';
import { z } from 'zod';

const router = Router();

router.get('/', (req, res) => {
  const rows = all(`SELECT * FROM os ORDER BY id DESC`);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const os = get('SELECT * FROM os WHERE id = @id', { id });
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });
  const items = all('SELECT * FROM os_items WHERE os_id = @id', { id });
  res.json({ ...os, items });
});

router.post('/', (req, res) => {
  const schema = z.object({
    number: z.string().min(1),
    client_name: z.string().min(2),
    contact: z.string().optional().default(''),
    device: z.string().optional().default(''),
    reported_issue: z.string().optional().default(''),
    diagnosis: z.string().optional().default(''),
    status: z.enum(['Orçado','Aprovado','Concluído','Entregue']).optional().default('Orçado'),
    items: z.array(z.object({
      type: z.enum(['service','part']),
      description: z.string().min(1),
      qty: z.number().min(0.01),
      unit_cost: z.number().min(0).default(0),
      unit_price: z.number().min(0).default(0)
    })).optional().default([])
  });
  const data = schema.parse(req.body);
  run(`INSERT INTO os (number, client_name, contact, device, reported_issue, diagnosis, status)
    VALUES (@number,@client_name,@contact,@device,@reported_issue,@diagnosis,@status)`, data);
  const os = get('SELECT * FROM os WHERE id = last_insert_rowid()');
  for (const it of data.items) {
    const total = it.qty * it.unit_price;
    run(`INSERT INTO os_items (os_id,type,description,qty,unit_cost,unit_price,total)
      VALUES (@os_id,@type,@description,@qty,@unit_cost,@unit_price,@total)`, { ...it, os_id: os.id, total });
  }
  const items = all('SELECT * FROM os_items WHERE os_id = @id', { id: os.id });
  res.status(201).json({ ...os, items });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const schema = z.object({
    number: z.string().min(1).optional(),
    client_name: z.string().min(2).optional(),
    contact: z.string().optional(),
    device: z.string().optional(),
    reported_issue: z.string().optional(),
    diagnosis: z.string().optional(),
    status: z.enum(['Orçado','Aprovado','Concluído','Entregue']).optional()
  });
  const data = schema.parse(req.body);
  const current = get('SELECT * FROM os WHERE id = @id', { id });
  if (!current) return res.status(404).json({ error: 'OS não encontrada' });
  const merged = { ...current, ...data };
  run(`UPDATE os SET number=@number, client_name=@client_name, contact=@contact, device=@device,
    reported_issue=@reported_issue, diagnosis=@diagnosis, status=@status WHERE id=@id`, { ...merged, id });
  res.json(get('SELECT * FROM os WHERE id = @id', { id }));
});

router.put('/:id/items', (req, res) => {
  const id = Number(req.params.id);
  const schema = z.array(z.object({
    id: z.number().optional(),
    type: z.enum(['service','part']),
    description: z.string().min(1),
    qty: z.number().min(0.01),
    unit_cost: z.number().min(0).default(0),
    unit_price: z.number().min(0).default(0)
  }));
  const items = schema.parse(req.body);

  run('DELETE FROM os_items WHERE os_id = @id', { id });
  for (const it of items) {
    const total = it.qty * it.unit_price;
    run(`INSERT INTO os_items (os_id,type,description,qty,unit_cost,unit_price,total)
      VALUES (@os_id,@type,@description,@qty,@unit_cost,@unit_price,@total)`, { ...it, os_id: id, total });
  }
  res.json(all('SELECT * FROM os_items WHERE os_id = @id', { id }));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  run('DELETE FROM os WHERE id = @id', { id });
  res.json({ ok: true });
});

export default router;


