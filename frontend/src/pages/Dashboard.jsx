import React from 'react'
import { useEffect, useState } from 'react'
import { FinanceApi } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard(){
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7))
  const [data, setData] = useState({ revenue:0, cost:0, profit:0, avgTicket:0, incomes:[], expenses:[] })

  useEffect(()=>{
    FinanceApi.dashboard(month).then(setData)
  },[month])

  const chartData = Array.from({length: 30}).map((_,i)=>({
    day: String(i+1).padStart(2,'0'),
    receita: (data.incomes || []).filter(x=>x.date.slice(8,10)===String(i+1).padStart(2,'0')).reduce((s,x)=>s+x.net,0),
    despesa: (data.expenses || []).filter(x=>x.date.slice(8,10)===String(i+1).padStart(2,'0')).reduce((s,x)=>s+x.amount,0)
  }))

  return (
    <div>
      <div className="row">
        <div className="card" style={{flex:1}}>
          <div>Mês</div>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        </div>
        <div className="card" style={{flex:1}}><div>Faturamento</div><h2>R$ {data.revenue.toFixed(2)}</h2></div>
        <div className="card" style={{flex:1}}><div>Despesas</div><h2>R$ {data.cost.toFixed(2)}</h2></div>
        <div className="card" style={{flex:1}}><div>Lucro</div><h2>R$ {data.profit.toFixed(2)}</h2></div>
        <div className="card" style={{flex:1}}><div>Ticket médio</div><h2>R$ {data.avgTicket.toFixed(2)}</h2></div>
      </div>
      <div className="card">
        <h3>Receitas x Despesas</h3>
        <div style={{height:300}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="receita" stroke="#22c55e" />
              <Line type="monotone" dataKey="despesa" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


