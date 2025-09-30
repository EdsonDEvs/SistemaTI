import { Router } from 'express';
import { get, run } from '../store/db.js';
import { z } from 'zod';

const router = Router();

router.get('/', (req, res) => {
  const s = get('SELECT * FROM settings WHERE id = 1');
  res.json(s);
});

router.put('/', (req, res) => {
  const schema = z.object({
    hourly_rate: z.number().min(0),
    margin_pct: z.number().min(0),
    tax_pct: z.number().min(0),
    card_fee_pct: z.number().min(0),
    urgency_multiplier: z.number().min(1),
    oncall_multiplier: z.number().min(1)
  });
  const data = schema.parse(req.body);
  run(`UPDATE settings SET
    hourly_rate=@hourly_rate,
    margin_pct=@margin_pct,
    tax_pct=@tax_pct,
    card_fee_pct=@card_fee_pct,
    urgency_multiplier=@urgency_multiplier,
    oncall_multiplier=@oncall_multiplier
    WHERE id = 1`, data);
  const s = get('SELECT * FROM settings WHERE id = 1');
  res.json(s);
});

export default router;


