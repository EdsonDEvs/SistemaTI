import { Router } from 'express';
import { get } from '../store/db.js';
import { z } from 'zod';

const router = Router();

function round2(n) { return Math.round(n * 100) / 100; }

router.post('/', (req, res) => {
  const settings = get('SELECT * FROM settings WHERE id = 1');
  const schema = z.object({
    hours: z.number().min(0),
    parts_cost: z.number().min(0),
    margin_pct: z.number().optional(),
    tax_pct: z.number().optional(),
    card_fee_pct: z.number().optional(),
    urgency: z.boolean().optional(),
    oncall: z.boolean().optional()
  });
  const p = schema.parse(req.body);

  const hourly = settings.hourly_rate;
  const margin = p.margin_pct ?? settings.margin_pct;
  const tax = p.tax_pct ?? settings.tax_pct;
  const card = p.card_fee_pct ?? settings.card_fee_pct;
  const multUrg = p.urgency ? settings.urgency_multiplier : 1;
  const multOn = p.oncall ? settings.oncall_multiplier : 1;

  const labor = p.hours * hourly;
  const base = labor + p.parts_cost;
  const baseWithMult = base * multUrg * multOn;
  const marginValue = baseWithMult * (margin / 100);
  const afterMargin = baseWithMult + marginValue;
  const taxValue = afterMargin * (tax / 100);
  const feeValue = afterMargin * (card / 100);
  const total = afterMargin + taxValue + feeValue;
  const profit = total - p.parts_cost - labor - taxValue - feeValue;
  const profitPct = total > 0 ? (profit / total) * 100 : 0;

  res.json({
    hourly_rate: hourly,
    labor: round2(labor),
    base: round2(base),
    base_with_multipliers: round2(baseWithMult),
    margin_pct: margin,
    margin_value: round2(marginValue),
    tax_pct: tax,
    tax_value: round2(taxValue),
    card_fee_pct: card,
    card_fee_value: round2(feeValue),
    total: round2(total),
    profit: round2(profit),
    profit_pct: round2(profitPct)
  });
});

export default router;


