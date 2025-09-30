import React, { useEffect, useMemo, useState } from 'react'
import { OrdersApi } from '../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// Importa o termo como texto bruto (Vite)
// Coloque/edite o arquivo em frontend/Termo.txt
import termoTemplate from '../../Termo.txt?raw'

export default function Orders(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ number:'', client_name:'', contact:'', device:'', reported_issue:'', diagnosis:'', status:'Orçado' })
  const [items, setItems] = useState([])

  useEffect(()=>{ OrdersApi.list().then(setList) },[])

  function addItem(){ setItems(prev=>[...prev, { type:'service', description:'', qty:1, unit_cost:0, unit_price:0 }]) }
  function changeItem(i, field, value){ setItems(prev=> prev.map((it,idx)=> idx===i? { ...it, [field]: (field==='qty'||field==='unit_cost'||field==='unit_price')? Number(value): value }: it)) }
  function removeItem(i){ setItems(prev=> prev.filter((_,idx)=> idx!==i)) }

  async function create(){
    const os = await OrdersApi.create({ ...form, items })
    setList(prev=>[os, ...prev])
    setForm({ number:'', client_name:'', contact:'', device:'', reported_issue:'', diagnosis:'', status:'Orçado' })
    setItems([])
  }

  function generatePDF(os){
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`Orçamento/OS #${os.number}`, 14, 18)
    doc.setFontSize(11)
    doc.text(`Cliente: ${os.client_name}`, 14, 26)
    if (os.contact) doc.text(`Contato: ${os.contact}`, 14, 32)
    if (os.device) doc.text(`Aparelho: ${os.device}`, 14, 38)
    if (os.reported_issue) doc.text(`Problema: ${os.reported_issue}`, 14, 44)
    if (os.diagnosis) doc.text(`Diagnóstico: ${os.diagnosis}`, 14, 50)

    const body = os.items.map(it => [it.type, it.description, it.qty, it.unit_price.toFixed(2), it.total.toFixed(2)])
    autoTable(doc, { startY: 58, head: [["Tipo","Descrição","Qtd","Vlr Unit","Total"]], body })
    const total = os.items.reduce((s,it)=> s + it.total, 0)
    doc.text(`Total: R$ ${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10)
    doc.save(`OS_${os.number}.pdf`)
  }

  function fallbackValue(v, alt='') { return (v===undefined || v===null) ? alt : v }

  function normalizeTemplate(txt){
    // Garante quebras de linha consistentes
    return String(txt || '').replace(/\r\n?/g,'\n')
  }

  function getByPath(obj, path, def=''){
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? def
  }

  function fillTemplate(template, os){
    const total = (os.items||[]).reduce((s,it)=> s + (it.total||0), 0)
    const itemsDesc = (os.items||[]).map(it=> `${it.type === 'part' ? 'Peça' : 'Serviço'}: ${it.description} (Qtd ${fallbackValue(it.qty,1)} | Vlr ${Number(it.unit_price||0).toFixed(2)} | Total ${Number(it.total||0).toFixed(2)})`).join('\n')
    const context = {
      os,
      total: total.toFixed(2),
      data: new Date().toLocaleDateString('pt-BR'),
      itens: itemsDesc,
    }
    let out = normalizeTemplate(template)
    // Substitui {{chave}} usando o contexto (ex.: {{os.number}}, {{total}}, {{itens}})
    out = out.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => {
      const v = getByPath(context, key.trim(), '')
      return String(v)
    })
    // Compatibilidade com placeholders antigos entre colchetes (parciais)
    out = out.replace(/\[Local e Data\]/g, context.data)
    out = out.replace(/\[Nome Completo do Cliente\]/g, fallbackValue(os.client_name,''))
    out = out.replace(/\[Aparelho\]/g, fallbackValue(os.device,''))
    return out
  }

  async function getTermText(){
    // Se import falhar (vazio), tenta buscar via fetch
    const imported = normalizeTemplate(termoTemplate)
    if (imported && imported.trim().length > 20) return imported
    try {
      const res = await fetch('/Termo.txt')
      const txt = await res.text()
      return normalizeTemplate(txt)
    } catch { return imported }
  }

  async function generateTermPDF(os){
    const base = await getTermText()
    const text = fillTemplate(base, os)
    const doc = new jsPDF({ unit:'pt', format:'a4' })
    const margin = 40
    const maxWidth = 595 - margin*2
    const lines = doc.splitTextToSize(text, maxWidth)
    let y = margin
    doc.setFont('helvetica','normal')
    doc.setFontSize(12)
    lines.forEach(line => {
      if (y > 800 - margin) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += 16
    })
    doc.save(`Termo_OS_${os.number}.pdf`)
  }

  return (
    <div>
      <div className="card">
        <h2>Novo Orçamento/OS</h2>
        <div className="row">
          <input placeholder="Nº OS" value={form.number} onChange={e=>setForm({...form, number:e.target.value})} />
          <input placeholder="Cliente" value={form.client_name} onChange={e=>setForm({...form, client_name:e.target.value})} />
          <input placeholder="Contato" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} />
          <input placeholder="Aparelho" value={form.device} onChange={e=>setForm({...form, device:e.target.value})} />
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option>Orçado</option><option>Aprovado</option><option>Concluído</option><option>Entregue</option>
          </select>
        </div>
        <div className="row">
          <input style={{flex:1}} placeholder="Problema relatado" value={form.reported_issue} onChange={e=>setForm({...form, reported_issue:e.target.value})} />
          <input style={{flex:1}} placeholder="Diagnóstico" value={form.diagnosis} onChange={e=>setForm({...form, diagnosis:e.target.value})} />
        </div>
        <div className="card" style={{marginTop:12}}>
          <div className="row">
            <button className="success" onClick={addItem}>Adicionar item</button>
          </div>
          {items.map((it, i)=> (
            <div key={i} className="row" style={{marginTop:8}}>
              <select value={it.type} onChange={e=>changeItem(i,'type',e.target.value)}>
                <option value="service">Serviço</option>
                <option value="part">Peça</option>
              </select>
              <input placeholder="Descrição" value={it.description} onChange={e=>changeItem(i,'description',e.target.value)} />
              <input type="number" step="0.01" placeholder="Qtd" value={it.qty} onChange={e=>changeItem(i,'qty',e.target.value)} />
              <input type="number" step="0.01" placeholder="Vlr Unit" value={it.unit_price} onChange={e=>changeItem(i,'unit_price',e.target.value)} />
              <button className="danger" onClick={()=>removeItem(i)}>Remover</button>
            </div>
          ))}
          <div className="row" style={{marginTop:8}}>
            <button className="primary" disabled={!form.number || !form.client_name} onClick={create}>Criar OS</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Ordens de Serviço</h2>
        <table>
          <thead><tr><th>Nº</th><th>Cliente</th><th>Status</th><th>Total</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map(os => {
              const total = (os.items||[]).reduce((s,it)=> s + it.total, 0)
              return (
                <tr key={os.id}>
                  <td>{os.number}</td><td>{os.client_name}</td><td>{os.status}</td><td>R$ {total.toFixed(2)}</td>
                  <td>
                    <button onClick={async()=>{ const full = await OrdersApi.get(os.id); generatePDF(full) }}>PDF</button>
                    <button onClick={async()=>{ const full = await OrdersApi.get(os.id); generateTermPDF(full) }}>Termo PDF</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

