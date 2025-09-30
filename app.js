// Utilidades de formatação
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function toNumber(input) {
  const value = typeof input === 'string' ? input.replace(/\./g, '').replace(',', '.') : input;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Estado
const state = {
  draft: null,
  services: [],
};

// Persistência
const STORAGE_KEY = 'sistemati_services_v1';
function loadServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    console.error('Erro ao ler storage', e);
    return [];
  }
}
function saveServices(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar storage', e);
  }
}

// Cálculo
function calculateTotals({ baseCost, hours, hourlyRate, markupPct, discountPct, taxPct }) {
  const labor = hours * hourlyRate;
  const subtotal = baseCost + labor;
  const markupValue = subtotal * (markupPct / 100);
  const afterMarkup = subtotal + markupValue;
  const discountValue = afterMarkup * (discountPct / 100);
  const afterDiscount = afterMarkup - discountValue;
  const taxValue = afterDiscount * (taxPct / 100);
  const total = afterDiscount + taxValue;
  return { subtotal, markupValue, discountValue, taxValue, total };
}

// DOM refs
const el = {
  form: document.getElementById('price-form'),
  name: document.getElementById('service-name'),
  baseCost: document.getElementById('base-cost'),
  hours: document.getElementById('hours'),
  hourlyRate: document.getElementById('hourly-rate'),
  markup: document.getElementById('markup'),
  discount: document.getElementById('discount'),
  tax: document.getElementById('tax'),
  btnCalc: document.getElementById('btn-calc'),
  btnAdd: document.getElementById('btn-add'),
  btnClear: document.getElementById('btn-clear'),
  subtotal: document.getElementById('subtotal'),
  markupValue: document.getElementById('markup-value'),
  discountValue: document.getElementById('discount-value'),
  taxValue: document.getElementById('tax-value'),
  total: document.getElementById('total'),
  tableBody: document.querySelector('#services-table tbody'),
  grandTotal: document.getElementById('grand-total'),
  btnExport: document.getElementById('btn-export'),
  btnDeleteAll: document.getElementById('btn-delete-all'),
};

function readForm() {
  return {
    name: el.name.value.trim(),
    baseCost: clamp(toNumber(el.baseCost.value), 0, 1e9),
    hours: clamp(toNumber(el.hours.value), 0, 1e5),
    hourlyRate: clamp(toNumber(el.hourlyRate.value), 0, 1e6),
    markupPct: clamp(toNumber(el.markup.value), 0, 1000),
    discountPct: clamp(toNumber(el.discount.value), 0, 100),
    taxPct: clamp(toNumber(el.tax.value), 0, 100),
  };
}

function updateResultView(res) {
  el.subtotal.textContent = currency.format(res.subtotal);
  el.markupValue.textContent = currency.format(res.markupValue);
  el.discountValue.textContent = `- ${currency.format(res.discountValue)}`;
  el.taxValue.textContent = currency.format(res.taxValue);
  el.total.textContent = currency.format(res.total);
}

function clearForm() {
  el.form.reset();
  updateResultView({ subtotal: 0, markupValue: 0, discountValue: 0, taxValue: 0, total: 0 });
  state.draft = null;
  el.btnAdd.disabled = true;
}

function recalc() {
  const data = readForm();
  if (!data.name) {
    el.btnAdd.disabled = true;
  }
  const res = calculateTotals({
    baseCost: data.baseCost,
    hours: data.hours,
    hourlyRate: data.hourlyRate,
    markupPct: data.markupPct,
    discountPct: data.discountPct,
    taxPct: data.taxPct,
  });
  updateResultView(res);
  state.draft = { ...data, ...res };
  el.btnAdd.disabled = !data.name || res.total <= 0;
}

function renderTable() {
  el.tableBody.innerHTML = '';
  let grand = 0;
  state.services.forEach((s, idx) => {
    grand += s.total;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${currency.format(s.baseCost)}</td>
      <td>${s.hours}</td>
      <td>${currency.format(s.hourlyRate)}</td>
      <td><span class="tag">${s.markupPct}%</span></td>
      <td><span class="tag">${s.discountPct}%</span></td>
      <td><span class="tag">${s.taxPct}%</span></td>
      <td>${currency.format(s.total)}</td>
      <td>
        <div class="row-actions">
          <button data-action="edit" data-index="${idx}">Editar</button>
          <button class="danger" data-action="delete" data-index="${idx}">Excluir</button>
        </div>
      </td>
    `;
    el.tableBody.appendChild(tr);
  });
  el.grandTotal.textContent = currency.format(grand);
}

function addServiceFromDraft() {
  if (!state.draft) return;
  state.services.push({ ...state.draft, createdAt: Date.now() });
  saveServices(state.services);
  renderTable();
  clearForm();
}

function onTableClick(e) {
  const target = e.target.closest('button');
  if (!target) return;
  const idx = Number(target.getAttribute('data-index'));
  const action = target.getAttribute('data-action');
  if (!Number.isInteger(idx)) return;
  if (action === 'delete') {
    state.services.splice(idx, 1);
    saveServices(state.services);
    renderTable();
  } else if (action === 'edit') {
    const s = state.services[idx];
    if (!s) return;
    el.name.value = s.name;
    el.baseCost.value = String(s.baseCost);
    el.hours.value = String(s.hours);
    el.hourlyRate.value = String(s.hourlyRate);
    el.markup.value = String(s.markupPct);
    el.discount.value = String(s.discountPct);
    el.tax.value = String(s.taxPct);
    state.draft = s;
    updateResultView(s);
    el.btnAdd.disabled = false;
  }
}

function exportCSV() {
  const headers = ['Serviço','Custo base','Horas','Valor por hora','Markup %','Desconto %','Impostos %','Subtotal','Markup R$','Desconto R$','Impostos R$','Total'];
  const rows = state.services.map(s => [
    s.name,
    s.baseCost.toFixed(2),
    s.hours,
    s.hourlyRate.toFixed(2),
    s.markupPct,
    s.discountPct,
    s.taxPct,
    s.subtotal.toFixed(2),
    s.markupValue.toFixed(2),
    s.discountValue.toFixed(2),
    s.taxValue.toFixed(2),
    s.total.toFixed(2),
  ]);
  const content = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0,10);
  a.download = `servicos_${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function deleteAll() {
  if (!confirm('Apagar todos os serviços?')) return;
  state.services = [];
  saveServices(state.services);
  renderTable();
}

function initDefaults() {
  // Valores padrão úteis para TI
  if (!el.hourlyRate.value) el.hourlyRate.value = '80';
  if (!el.markup.value) el.markup.value = '30';
  if (!el.tax.value) el.tax.value = '8';
}

function init() {
  document.getElementById('year').textContent = String(new Date().getFullYear());
  initDefaults();
  state.services = loadServices();
  renderTable();
  recalc();

  el.btnCalc.addEventListener('click', recalc);
  el.btnClear.addEventListener('click', clearForm);
  el.btnAdd.addEventListener('click', (e) => { e.preventDefault(); addServiceFromDraft(); });
  el.form.addEventListener('submit', (e) => { e.preventDefault(); addServiceFromDraft(); });
  document.getElementById('services-table').addEventListener('click', onTableClick);
  el.btnExport.addEventListener('click', exportCSV);
  el.btnDeleteAll.addEventListener('click', deleteAll);

  // Recalcular ao digitar
  ['input','change'].forEach(evt => {
    [el.name, el.baseCost, el.hours, el.hourlyRate, el.markup, el.discount, el.tax].forEach(i => {
      i.addEventListener(evt, recalc);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);



