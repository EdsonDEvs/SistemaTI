import { Router } from 'express';
import { all, get, run } from '../store/db.js';
import { hasFirebase, getFirestore } from '../store/firebase.js';
import { z } from 'zod';

const router = Router();

function suggestPrice({ hours, parts_cost }, settings) {
  const labor = hours * settings.hourly_rate;
  const base = labor + parts_cost;
  const afterMargin = base * (1 + settings.margin_pct / 100);
  const withTax = afterMargin * (1 + settings.tax_pct / 100);
  const withCard = withTax * (1 + settings.card_fee_pct / 100);
  return Math.round(withCard * 100) / 100;
}

router.get('/', async (req, res) => {
  if (hasFirebase()) {
    try {
      const db = getFirestore();
      const snap = await db.collection('services').get();
      const out = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(service => service.active === 1 || service.active === true)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return res.json(out);
    } catch (error) {
      console.error('Firebase error:', error);
      // Fallback to SQLite
      const rows = all('SELECT * FROM services WHERE active = 1 ORDER BY name');
      return res.json(rows);
    }
  }
  const rows = all('SELECT * FROM services WHERE active = 1 ORDER BY name');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    description: z.string().optional().default(''),
    default_hours: z.number().min(0).default(1),
    parts_cost: z.number().min(0).default(0),
    suggested_price: z.number().min(0).optional(),
    date: z.string().optional().default(new Date().toISOString().slice(0,10))
  });
  const data = schema.parse(req.body);
  if (hasFirebase()) {
    const db = getFirestore();
    const payload = { ...data, active: 1, suggested_price: data.suggested_price ?? data.parts_cost, created_at: new Date().toISOString() };
    const ref = await db.collection('services').add(payload);
    let ticketId = null;
    try {
      const t = await db.collection('tickets').add({
        title: payload.name,
        description: payload.description,
        client: '',
        device: '',
        status: 'Aberto',
        priority: 'Média',
        created_at: new Date().toISOString(),
        due_date: payload.date || ''
      });
      ticketId = t.id;
      await ref.set({ ticket_id: ticketId }, { merge: true });
    } catch {}
    let osId = null;
    try {
      // Criar OS básica com um item do serviço lançado
      const number = `OS-${Date.now()}`;
      const osRef = await db.collection('os').add({ number, client_name: '', contact: '', device: '', reported_issue: payload.description||'', diagnosis: '', status: 'Orçado', created_at: new Date().toISOString() });
      osId = osRef.id;
      await db.collection('os_items').add({ os_id: osId, type: 'service', description: payload.name, qty: 1, unit_cost: payload.parts_cost||0, unit_price: payload.suggested_price||0, total: payload.suggested_price||0 });
      await ref.set({ os_id: osId }, { merge: true });
    } catch {}
    const srv = { id: ref.id, ...payload, ticket_id: ticketId, os_id: osId };
    try { await db.collection('finance_income').add({ date: data.date, client: data.name, gross: payload.suggested_price, discounts:0, fees:0, taxes:0, net: payload.suggested_price, created_at: new Date().toISOString() }); } catch {}
    return res.status(201).json(srv);
  }
  const settings = get('SELECT * FROM settings WHERE id = 1');
  const price = data.suggested_price ?? suggestPrice({ hours: data.default_hours, parts_cost: data.parts_cost }, settings);
  run(`INSERT INTO services (name, description, default_hours, parts_cost, suggested_price, date) 
    VALUES (@name, @description, @default_hours, @parts_cost, @price, @date)`, { ...data, price });
  let srv = get('SELECT * FROM services WHERE id = last_insert_rowid()');
  try {
    // Criar ticket correlato
    const t = run(`INSERT INTO tickets (title,description,status,priority,due_date) VALUES (@title,@description,'Aberto','Média',@due)`, { title: srv.name, description: srv.description||'', due: srv.date||'' });
    const ticketRow = get('SELECT id FROM tickets WHERE id = last_insert_rowid()');
    run('UPDATE services SET ticket_id=@tid WHERE id=@id', { tid: String(ticketRow.id), id: srv.id });
  } catch {}
  try {
    // Criar OS básica com item
    const number = `OS-${Date.now()}`;
    run(`INSERT INTO os (number, client_name, contact, device, reported_issue, diagnosis, status) VALUES (@number,'','','',@issue,'','Orçado')`, { number, issue: srv.description||'' });
    const osRow = get('SELECT id FROM os WHERE id = last_insert_rowid()');
    run(`INSERT INTO os_items (os_id,type,description,qty,unit_cost,unit_price,total) VALUES (@os,'service',@desc,1,@uc,@up,@tot)`, { os: osRow.id, desc: srv.name, uc: srv.parts_cost||0, up: srv.suggested_price||0, tot: srv.suggested_price||0 });
    run('UPDATE services SET os_id=@os WHERE id=@id', { os: osRow.id, id: srv.id });
  } catch {}
  srv = get('SELECT * FROM services WHERE id = @id', { id: srv.id });
  try {
    const net = srv.suggested_price;
    const date = srv.date || new Date().toISOString().slice(0,10);
    run(`INSERT INTO finance_income (date, client, gross, discounts, fees, taxes, net, os_id)
      VALUES (@date, @client, @gross, 0, 0, 0, @net, NULL)`, { date, client: srv.name, gross: net, net });
  } catch {}
  res.status(201).json(srv);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const schema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    default_hours: z.number().min(0).optional(),
    parts_cost: z.number().min(0).optional(),
    suggested_price: z.number().min(0).optional(),
    date: z.string().optional(),
    active: z.number().int().min(0).max(1).optional()
  });
  const data = schema.parse(req.body);
  if (hasFirebase()) {
    const db = getFirestore();
    const ref = db.collection('services').doc(String(req.params.id));
    await ref.set(data, { merge: true });
    const snap = await ref.get();
    return res.json({ id: snap.id, ...snap.data() });
  }
  const current = get('SELECT * FROM services WHERE id = @id', { id });
  if (!current) return res.status(404).json({ error: 'Serviço não encontrado' });
  const merged = { ...current, ...data };
  if (data.suggested_price === undefined) {
    const settings = get('SELECT * FROM settings WHERE id = 1');
    merged.suggested_price = suggestPrice({ hours: merged.default_hours, parts_cost: merged.parts_cost }, settings);
  }
  run(`UPDATE services SET 
      name=@name, description=@description, default_hours=@default_hours, 
      parts_cost=@parts_cost, suggested_price=@suggested_price, date=@date, active=@active
    WHERE id=@id`, { ...merged, id });
  const srv = get('SELECT * FROM services WHERE id = @id', { id });
  res.json(srv);
});

router.delete('/:id', async (req, res) => {
  if (hasFirebase()) {
    const db = getFirestore();
    await db.collection('services').doc(String(req.params.id)).set({ active: 0 }, { merge: true });
    return res.json({ ok: true });
  }
  const id = Number(req.params.id);
  run('UPDATE services SET active = 0 WHERE id = @id', { id });
  res.json({ ok: true });
});

export default router;

