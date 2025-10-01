import React, { useEffect, useState } from 'react'
import { FinanceApi } from '../lib/api'

export default function Expenses(){
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [form, setForm] = useState({ 
    date: new Date().toISOString().slice(0,10), 
    category:'', 
    description:'', 
    amount:0, 
    fixed:false 
  })
  const [filters, setFilters] = useState({
    category: '',
    month: new Date().toISOString().slice(0,7),
    fixed: 'all'
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(()=>{ 
    reload() 
  },[])

  useEffect(()=>{
    filterExpenses()
  },[expenses, filters])

  function reload(){ 
    FinanceApi.expenseList().then(setExpenses)
  }

  function filterExpenses(){
    let filtered = expenses || []

    if(filters.category){
      filtered = filtered.filter(e => e.category.toLowerCase().includes(filters.category.toLowerCase()))
    }

    if(filters.month){
      filtered = filtered.filter(e => e.date.startsWith(filters.month))
    }

    if(filters.fixed !== 'all'){
      filtered = filtered.filter(e => filters.fixed === 'yes' ? e.fixed : !e.fixed)
    }

    setFilteredExpenses(filtered)
  }

  function handleSubmit(e){
    e.preventDefault()
    if(editingId){
      FinanceApi.expenseUpdate(editingId, form).then(() => {
        reload()
        setForm({ date: new Date().toISOString().slice(0,10), category:'', description:'', amount:0, fixed:false })
        setEditingId(null)
      })
    } else {
      FinanceApi.expenseCreate(form).then(() => {
        reload()
        setForm({ date: new Date().toISOString().slice(0,10), category:'', description:'', amount:0, fixed:false })
      })
    }
  }

  function handleEdit(expense){
    setForm(expense)
    setEditingId(expense.id)
  }

  function handleDelete(id){
    if(confirm('Tem certeza que deseja excluir este gasto?')){
      FinanceApi.expenseDelete(id).then(() => reload())
    }
  }

  function handleCancel(){
    setForm({ date: new Date().toISOString().slice(0,10), category:'', description:'', amount:0, fixed:false })
    setEditingId(null)
  }

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const categories = [...new Set(expenses.map(e => e.category))]

  return (
    <div>
      <div className="card">
        <h2>Controle de Gastos</h2>
        
        {/* Filtros */}
        <div className="row" style={{marginBottom: '20px', gap: '10px'}}>
          <input 
            type="month" 
            value={filters.month} 
            onChange={e=>setFilters({...filters, month: e.target.value})}
            placeholder="Mês"
          />
          <select 
            value={filters.category} 
            onChange={e=>setFilters({...filters, category: e.target.value})}
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={filters.fixed} 
            onChange={e=>setFilters({...filters, fixed: e.target.value})}
          >
            <option value="all">Todos</option>
            <option value="yes">Fixos</option>
            <option value="no">Variáveis</option>
          </select>
        </div>

        {/* Resumo */}
        <div className="row" style={{marginBottom: '20px'}}>
          <div className="card" style={{flex: 1, textAlign: 'center'}}>
            <div>Total de Gastos</div>
            <h2 style={{color: '#ef4444'}}>R$ {totalAmount.toFixed(2)}</h2>
          </div>
          <div className="card" style={{flex: 1, textAlign: 'center'}}>
            <div>Quantidade</div>
            <h2>{filteredExpenses.length}</h2>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="row" style={{marginBottom: '20px', gap: '10px'}}>
          <input 
            type="date" 
            value={form.date} 
            onChange={e=>setForm({...form, date: e.target.value})}
            required
          />
          <input 
            placeholder="Categoria" 
            value={form.category} 
            onChange={e=>setForm({...form, category: e.target.value})}
            required
          />
          <input 
            placeholder="Descrição" 
            value={form.description} 
            onChange={e=>setForm({...form, description: e.target.value})}
          />
          <input 
            type="number" 
            step="0.01" 
            placeholder="Valor" 
            value={form.amount} 
            onChange={e=>setForm({...form, amount: Number(e.target.value)})}
            required
          />
          <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <input 
              type="checkbox" 
              checked={form.fixed} 
              onChange={e=>setForm({...form, fixed: e.target.checked})} 
            />
            Fixo
          </label>
          <button type="submit" className="primary">
            {editingId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="secondary">
              Cancelar
            </button>
          )}
        </form>

        {/* Tabela */}
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td>{expense.description || '-'}</td>
                <td>R$ {expense.amount.toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: expense.fixed ? '#fef3c7' : '#dbeafe',
                    color: expense.fixed ? '#92400e' : '#1e40af'
                  }}>
                    {expense.fixed ? 'Fixo' : 'Variável'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(expense)}
                    className="secondary"
                    style={{marginRight: '5px'}}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="danger"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExpenses.length === 0 && (
          <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
            Nenhum gasto encontrado com os filtros aplicados
          </div>
        )}
      </div>
    </div>
  )
}
