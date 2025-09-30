import React, { useEffect, useMemo, useState } from 'react'
import { TicketsApi } from '../lib/api'

export default function Tickets(){
  const [list, setList] = useState([])
  const [f, setF] = useState({ title:'', description:'', client:'', device:'', priority:'Média', status:'Aberto', due_date:'' })
  const [q, setQ] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(true)

  useEffect(()=>{ reload() },[])
  async function reload(){ setList(await TicketsApi.list()) }

  async function create(){
    const t = await TicketsApi.create(f)
    setList(prev=>[t, ...prev])
    setF({ title:'', description:'', client:'', device:'', priority:'Média', status:'Aberto', due_date:'' })
  }

  async function update(t, data){
    const updated = await TicketsApi.update(t.id, data)
    setList(prev=> prev.map(x=> x.id===t.id? updated: x))
  }

  async function remove(t){
    await TicketsApi.remove(t.id)
    setList(prev=> prev.filter(x=> x.id!==t.id))
  }

  const filtered = useMemo(()=> list.filter(t => {
    if (onlyOpen && (t.status==='Concluído')) return false
    const s = `${t.title} ${t.client} ${t.device}`.toLowerCase()
    return s.includes(q.toLowerCase())
  }), [list, q, onlyOpen])

  function badge(color, text){ return <span className="tag" style={{borderColor:color, color}}>{text}</span> }

  return (
    <div>
      <div className="card">
        <h2>Novo chamado</h2>
        <div className="row">
          <input placeholder="Título" value={f.title} onChange={e=>setF({...f, title:e.target.value})} />
          <input placeholder="Cliente" value={f.client} onChange={e=>setF({...f, client:e.target.value})} />
          <input placeholder="Aparelho" value={f.device} onChange={e=>setF({...f, device:e.target.value})} />
          <select value={f.priority} onChange={e=>setF({...f, priority:e.target.value})}>
            <option>Baixa</option><option>Média</option><option>Alta</option><option>Urgente</option>
          </select>
          <input type="date" value={f.due_date} onChange={e=>setF({...f, due_date:e.target.value})} />
          <button className="primary" disabled={!f.title} onClick={create}>Criar</button>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h2>Chamados</h2>
          <div className="row">
            <input placeholder="Buscar" value={q} onChange={e=>setQ(e.target.value)} />
            <label><input type="checkbox" checked={onlyOpen} onChange={e=>setOnlyOpen(e.target.checked)} /> Somente abertos</label>
          </div>
        </div>
        <table>
          <thead><tr><th>Prioridade</th><th>Título</th><th>Cliente</th><th>Aparelho</th><th>Status</th><th>Entrega</th><th>Ações</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td>
                  {t.priority==='Urgente' && badge('#ef4444','Urgente')}
                  {t.priority==='Alta' && badge('#f59e0b','Alta')}
                  {t.priority==='Média' && badge('#3b82f6','Média')}
                  {t.priority==='Baixa' && badge('#22c55e','Baixa')}
                </td>
                <td>{t.title}</td>
                <td>{t.client||'-'}</td>
                <td>{t.device||'-'}</td>
                <td>
                  <select value={t.status} onChange={e=>update(t,{ status:e.target.value })}>
                    <option>Aberto</option><option>Em andamento</option><option>Pausado</option><option>Concluído</option>
                  </select>
                </td>
                <td>{t.due_date||'-'}</td>
                <td style={{display:'flex', gap:8}}>
                  <button onClick={()=>update(t,{ priority: 'Urgente' })}>↑ Prioridade</button>
                  <button className="danger" onClick={()=>remove(t)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


