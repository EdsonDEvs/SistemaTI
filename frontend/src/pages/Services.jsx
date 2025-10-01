import React, { useEffect, useState } from 'react'
import { ServicesApi } from '../lib/api'

export default function Services(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name:'', description:'', parts_cost:0, labor_price:0, total_price:0, date: new Date().toISOString().slice(0,10) })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ date:'', name:'', parts_cost:0, suggested_price:0 })

  useEffect(()=>{ ServicesApi.list().then(setItems) },[])

  function handleChange(e){
    const {name,value} = e.target
    const numFields = ['parts_cost','labor_price','total_price']
    const v = numFields.includes(name) ? Number(value) : value
    setForm(prev=>{
      const next = { ...prev, [name]: v }
      if (name==='parts_cost' || name==='labor_price') {
        next.total_price = Number((Number(next.parts_cost||0) + Number(next.labor_price||0)).toFixed(2))
      }
      return next
    })
  }

  async function add(){
    // No backend: salvar parts_cost como custo de produtos e suggested_price como total (produtos + mão de obra)
    const payload = { name: form.name, description: form.description, parts_cost: form.parts_cost, suggested_price: form.total_price, date: form.date }
    const created = await ServicesApi.create(payload)
    setItems(prev=>[...prev, created])
    setForm({ name:'', description:'', parts_cost:0, labor_price:0, total_price:0, date: new Date().toISOString().slice(0,10) })
  }

  async function remove(id){
    await ServicesApi.remove(id)
    setItems(prev=>prev.filter(x=>x.id!==id))
  }

  function startEdit(s){
    setEditId(s.id)
    setEditForm({
      date: s.date || new Date().toISOString().slice(0,10),
      name: s.name,
      parts_cost: Number(s.parts_cost || 0),
      suggested_price: Number(s.suggested_price || 0),
    })
  }

  function onEditChange(field, value){
    setEditForm(prev=> ({ ...prev, [field]: field==='parts_cost'||field==='suggested_price' ? Number(value) : value }))
  }

  async function saveEdit(){
    const id = editId
    const payload = { date: editForm.date, name: editForm.name, parts_cost: editForm.parts_cost, suggested_price: editForm.suggested_price }
    const updated = await ServicesApi.update(id, payload)
    setItems(prev=> prev.map(it=> it.id===id? updated: it))
    setEditId(null)
  }

  function cancelEdit(){ setEditId(null) }

  return (
    <div>
      <div className="card">
        <h2>Novo serviço (preço manual)</h2>
        <div className="row" style={{gap:8, marginBottom:6, alignItems:'center'}}>
          <span style={{color:'#9ca3af'}}>Legenda:</span>
          <span className="tag">Produtos (peças): custo de materiais</span>
          <span className="tag">Mão de obra: valor do serviço</span>
          <span className="tag">Total: produtos + mão de obra</span>
        </div>
        <div className="row">
          <label style={{display:'flex', flexDirection:'column', gap:6}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Data</span>
            <input name="date" type="date" value={form.date} onChange={handleChange} />
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:6}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Nome do serviço</span>
            <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} />
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:6, flex:1}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Descrição (opcional)</span>
            <input name="description" placeholder="Descrição" value={form.description} onChange={handleChange} />
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:6}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Produtos (peças) R$</span>
            <input name="parts_cost" type="number" step="0.01" placeholder="0,00" value={form.parts_cost} onChange={handleChange} />
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:6}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Mão de obra R$</span>
            <input name="labor_price" type="number" step="0.01" placeholder="0,00" value={form.labor_price} onChange={handleChange} />
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:6}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Total R$</span>
            <input name="total_price" type="number" step="0.01" placeholder="0,00" value={form.total_price} onChange={handleChange} />
          </label>
          <button className="primary" disabled={!form.name || form.total_price<=0} onClick={add}>Adicionar</button>
        </div>
      </div>

      <div className="card">
        <h2>Serviços cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Nome</th><th>Produtos (R$)</th><th>Preço (R$)</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) ? items.map(s=> {
              const isEditing = editId === s.id
              return (
                <tr key={s.id}>
                  <td>{isEditing ? <input type="date" value={editForm.date} onChange={e=>onEditChange('date', e.target.value)} /> : (s.date || '-')}</td>
                  <td>{isEditing ? <input value={editForm.name} onChange={e=>onEditChange('name', e.target.value)} /> : s.name}</td>
                  <td>{isEditing ? <input type="number" step="0.01" value={editForm.parts_cost} onChange={e=>onEditChange('parts_cost', e.target.value)} /> : `R$ ${s.parts_cost.toFixed(2)}`}</td>
                  <td>{isEditing ? <input type="number" step="0.01" value={editForm.suggested_price} onChange={e=>onEditChange('suggested_price', e.target.value)} /> : `R$ ${s.suggested_price.toFixed(2)}`}</td>
                  <td style={{display:'flex', gap:8}}>
                    {isEditing ? (
                      <>
                        <button className="success" onClick={saveEdit}>Salvar</button>
                        <button onClick={cancelEdit}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>startEdit(s)}>Editar</button>
                        <button className="danger" onClick={()=>remove(s.id)}>Excluir</button>
                      </>
                    )}
                  </td>
                </tr>
              )
            }) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

