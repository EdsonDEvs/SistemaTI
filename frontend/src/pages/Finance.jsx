import React, { useEffect, useState } from 'react'
import { FinanceApi } from '../lib/api'

export default function Finance(){
  const [income, setIncome] = useState([])
  const [expense, setExpense] = useState([])
  const [fi, setFi] = useState({ date: new Date().toISOString().slice(0,10), client:'', gross:0, discounts:0, fees:0, taxes:0, net:0 })
  const [fe, setFe] = useState({ date: new Date().toISOString().slice(0,10), category:'', description:'', amount:0, fixed:false })

  useEffect(()=>{ reload() },[])
  function reload(){ Promise.all([FinanceApi.incomeList(), FinanceApi.expenseList()]).then(([a,b])=>{ setIncome(a); setExpense(b) }) }

  return (
    <div>
      <div className="card">
        <h2>Receitas</h2>
        <div className="row">
          <input type="date" value={fi.date} onChange={e=>setFi({...fi, date:e.target.value})} />
          <input placeholder="Cliente" value={fi.client} onChange={e=>setFi({...fi, client:e.target.value})} />
          <input type="number" step="0.01" placeholder="Bruto" value={fi.gross} onChange={e=>setFi({...fi, gross:Number(e.target.value)})} />
          <input type="number" step="0.01" placeholder="Descontos" value={fi.discounts} onChange={e=>setFi({...fi, discounts:Number(e.target.value)})} />
          <input type="number" step="0.01" placeholder="Taxas" value={fi.fees} onChange={e=>setFi({...fi, fees:Number(e.target.value)})} />
          <input type="number" step="0.01" placeholder="Impostos" value={fi.taxes} onChange={e=>setFi({...fi, taxes:Number(e.target.value)})} />
          <input type="number" step="0.01" placeholder="Líquido" value={fi.net} onChange={e=>setFi({...fi, net:Number(e.target.value)})} />
          <button className="primary" onClick={async()=>{ await FinanceApi.incomeCreate(fi); reload() }}>Adicionar</button>
        </div>
        <table>
          <thead><tr><th>Data</th><th>Cliente</th><th>Líquido</th></tr></thead>
          <tbody>
            {Array.isArray(income) ? income.map(i=> <tr key={i.id}><td>{i.date}</td><td>{i.client}</td><td>R$ {i.net.toFixed(2)}</td></tr>) : null}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Despesas</h2>
        <div className="row">
          <input type="date" value={fe.date} onChange={e=>setFe({...fe, date:e.target.value})} />
          <input placeholder="Categoria" value={fe.category} onChange={e=>setFe({...fe, category:e.target.value})} />
          <input placeholder="Descrição" value={fe.description} onChange={e=>setFe({...fe, description:e.target.value})} />
          <input type="number" step="0.01" placeholder="Valor" value={fe.amount} onChange={e=>setFe({...fe, amount:Number(e.target.value)})} />
          <label><input type="checkbox" checked={fe.fixed} onChange={e=>setFe({...fe, fixed:e.target.checked})} /> Fixa</label>
          <button className="danger" onClick={async()=>{ await FinanceApi.expenseCreate(fe); reload() }}>Adicionar</button>
        </div>
        <table>
          <thead><tr><th>Data</th><th>Categoria</th><th>Valor</th></tr></thead>
          <tbody>
            {Array.isArray(expense) ? expense.map(i=> <tr key={i.id}><td>{i.date}</td><td>{i.category}</td><td>R$ {i.amount.toFixed(2)}</td></tr>) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}


