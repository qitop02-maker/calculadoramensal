import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit2, 
  PieChart, 
  LayoutDashboard, 
  Filter,
  Download,
  X,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bill, Category, Group, Status, MonthlyStats } from './types';
import { SEED_DATA, CATEGORIES, GROUPS, MONTHS } from './constants';
import { supabase } from './lib/supabase';

const LOCAL_STORAGE_KEY = 'gestor_contas_data';

export default function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load initial data from LocalStorage then sync with Supabase
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      setBills(JSON.parse(savedData));
    } else {
      setBills(SEED_DATA);
    }
    fetchBillsFromSupabase();
  }, []);

  // Save to LocalStorage whenever bills change
  useEffect(() => {
    if (bills.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bills));
    }
  }, [bills]);

  const fetchBillsFromSupabase = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setBills(data);
        setLastSync(new Date());
      } else if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        // If Supabase is empty and no local storage, seed Supabase
        await seedSupabase();
      }
    } catch (err: any) {
      console.error('Error fetching from Supabase:', err);
      setSyncError('Erro ao sincronizar com a nuvem');
    } finally {
      setIsSyncing(false);
    }
  };

  const seedSupabase = async () => {
    try {
      const { error } = await supabase
        .from('bills')
        .insert(SEED_DATA);
      if (error) throw error;
      setBills(SEED_DATA);
      setLastSync(new Date());
    } catch (err) {
      console.error('Error seeding Supabase:', err);
    }
  };

  const syncBillToSupabase = async (bill: Bill) => {
    try {
      const { error } = await supabase
        .from('bills')
        .upsert(bill);
      if (error) throw error;
      setLastSync(new Date());
    } catch (err) {
      console.error('Error syncing bill:', err);
      setSyncError('Erro ao salvar na nuvem');
    }
  };

  const deleteBillFromSupabase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setLastSync(new Date());
    } catch (err) {
      console.error('Error deleting bill:', err);
      setSyncError('Erro ao excluir na nuvem');
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const monthMatch = bill.mes_ref === selectedMonth;
      const statusMatch = filter === 'todos' || bill.status === filter;
      return monthMatch && statusMatch;
    });
  }, [bills, selectedMonth, filter]);

  const stats = useMemo((): MonthlyStats => {
    const monthBills = bills.filter(b => b.mes_ref === selectedMonth);
    return {
      total: monthBills.reduce((acc, b) => acc + b.valor, 0),
      pago: monthBills.filter(b => b.status === 'pago').reduce((acc, b) => acc + b.valor, 0),
      pendente: monthBills.filter(b => b.status === 'pendente').reduce((acc, b) => acc + b.valor, 0),
    };
  }, [bills, selectedMonth]);

  const groupedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {};
    filteredBills.forEach(bill => {
      if (!groups[bill.grupo]) groups[bill.grupo] = [];
      groups[bill.grupo].push(bill);
    });
    return groups;
  }, [filteredBills]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const toggleStatus = async (id: string) => {
    const billToUpdate = bills.find(b => b.id === id);
    if (!billToUpdate) return;

    const updatedBill = { 
      ...billToUpdate, 
      status: billToUpdate.status === 'pago' ? 'pendente' : 'pago' as Status 
    };

    setBills(prev => prev.map(bill => bill.id === id ? updatedBill : bill));
    await syncBillToSupabase(updatedBill);
  };

  const deleteBill = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setBills(prev => prev.filter(bill => bill.id !== id));
      await deleteBillFromSupabase(id);
    }
  };

  const getNextMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  };

  const handleSaveBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const isParcelado = formData.get('parcelado') === 'on';
    const parcelaAtual = formData.get('parcela_atual') ? parseInt(formData.get('parcela_atual') as string) : 1;
    const parcelaTotal = formData.get('parcela_total') ? parseInt(formData.get('parcela_total') as string) : 1;
    
    const baseBill: Partial<Bill> = {
      nome: formData.get('nome') as string,
      valor: parseFloat(formData.get('valor') as string),
      categoria: formData.get('categoria') as Category,
      grupo: formData.get('grupo') as string,
      vencimento: formData.get('vencimento') ? parseInt(formData.get('vencimento') as string) : undefined,
      parcelado: isParcelado,
      status: (formData.get('status') as Status) || 'pendente',
      observacoes: formData.get('observacoes') as string,
    };

    if (editingBill) {
      const updatedBill: Bill = {
        ...editingBill,
        ...baseBill,
        mes_ref: editingBill.mes_ref, // Keep original month on edit
        parcela_atual: isParcelado ? parcelaAtual : undefined,
        parcela_total: isParcelado ? parcelaTotal : undefined,
      } as Bill;

      setBills(prev => prev.map(b => b.id === editingBill.id ? updatedBill : b));
      await syncBillToSupabase(updatedBill);
    } else {
      // Logic for adding new bill(s)
      const billsToAdd: Bill[] = [];
      
      if (isParcelado && parcelaTotal > 1) {
        let currentMonth = selectedMonth;
        const groupId = crypto.randomUUID(); // Optional: link installments together if needed in future

        for (let p = parcelaAtual; p <= parcelaTotal; p++) {
          billsToAdd.push({
            ...baseBill,
            id: crypto.randomUUID(),
            mes_ref: currentMonth,
            parcela_atual: p,
            parcela_total: parcelaTotal,
          } as Bill);
          currentMonth = getNextMonth(currentMonth);
        }
      } else {
        billsToAdd.push({
          ...baseBill,
          id: crypto.randomUUID(),
          mes_ref: selectedMonth,
          parcela_atual: isParcelado ? parcelaAtual : undefined,
          parcela_total: isParcelado ? parcelaTotal : undefined,
        } as Bill);
      }

      setBills(prev => [...prev, ...billsToAdd]);
      
      // Bulk sync to Supabase
      try {
        const { error } = await supabase.from('bills').insert(billsToAdd);
        if (error) throw error;
        setLastSync(new Date());
      } catch (err) {
        console.error('Error bulk syncing bills:', err);
        setSyncError('Erro ao salvar parcelas na nuvem');
      }
    }

    setIsModalOpen(false);
    setEditingBill(null);
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Valor', 'Grupo', 'Categoria', 'Parcela', 'Status'];
    const rows = filteredBills.map(b => [
      b.nome,
      b.valor.toFixed(2),
      b.grupo,
      b.categoria,
      b.parcelado ? `${b.parcela_atual}/${b.parcela_total}` : '-',
      b.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `contas_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-semibold tracking-tight">Gestor de Contas</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : syncError ? (
                <CloudOff className="w-4 h-4 text-red-500" title={syncError} />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-600 opacity-40" />
              )}
              <span className="text-[10px] font-medium text-black/40 hidden sm:inline">
                {isSyncing ? 'Sincronizando...' : lastSync ? `Sinc: ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Offline'}
              </span>
            </div>
            <button 
              onClick={exportCSV}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              title="Exportar CSV"
            >
              <Download className="w-5 h-5 opacity-60" />
            </button>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-black/5 border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-black/5"
          >
            <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Total do Mês</p>
            <p className="text-2xl font-light tracking-tight">{formatCurrency(stats.total)}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-black/5"
          >
            <p className="text-xs font-semibold text-emerald-600/60 uppercase tracking-wider mb-1">Total Pago</p>
            <p className="text-2xl font-light tracking-tight text-emerald-600">{formatCurrency(stats.pago)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-black/5"
          >
            <p className="text-xs font-semibold text-red-600/60 uppercase tracking-wider mb-1">Total Pendente</p>
            <p className="text-2xl font-light tracking-tight text-red-600">{formatCurrency(stats.pendente)}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'todos' ? 'bg-black text-white' : 'bg-white text-black/60 border border-black/5 hover:bg-black/5'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('pendente')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'pendente' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white text-black/60 border border-black/5 hover:bg-black/5'}`}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setFilter('pago')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === 'pago' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-black/60 border border-black/5 hover:bg-black/5'}`}
          >
            Pagos
          </button>
        </div>

        {/* Bill List by Group */}
        <div className="space-y-4">
          {(Object.entries(groupedBills) as [string, Bill[]][]).map(([group, groupBills]) => {
            const groupTotal = groupBills.reduce((acc, b) => acc + b.valor, 0);
            const isCollapsed = collapsedGroups[group];

            return (
              <div key={group} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <button 
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }))}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{group}</h3>
                      <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Total: {formatCurrency(groupTotal)}</p>
                    </div>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-5 h-5 opacity-40" /> : <ChevronUp className="w-5 h-5 opacity-40" />}
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-3 border-t border-black/5 pt-4">
                        {groupBills.map(bill => (
                          <div key={bill.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4 flex-1">
                              <button 
                                onClick={() => toggleStatus(bill.id)}
                                className="transition-transform active:scale-90"
                              >
                                {bill.status === 'pago' ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <Circle className="w-6 h-6 text-black/10" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${bill.status === 'pago' ? 'text-black/40 line-through' : 'text-black'}`}>
                                    {bill.nome}
                                  </span>
                                  {bill.parcelado && (
                                    <span className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded font-mono text-black/60">
                                      {bill.parcela_atual}/{bill.parcela_total}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-black/40">{bill.categoria}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-mono text-sm ${bill.status === 'pago' ? 'text-black/40' : 'text-black'}`}>
                                {formatCurrency(bill.valor)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingBill(bill);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteBill(bill.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-full text-black/40 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <PieChart className="w-12 h-12 text-black/10 mx-auto" />
            <p className="text-black/40">Nenhuma conta encontrada para este mês.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setEditingBill(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editingBill ? 'Editar Conta' : 'Nova Conta'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-5 h-5 opacity-40" />
                </button>
              </div>
              
              <form onSubmit={handleSaveBill} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Nome da Conta</label>
                  <input 
                    name="nome"
                    required
                    defaultValue={editingBill?.nome}
                    placeholder="Ex: Aluguel, Internet..."
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Valor (R$)</label>
                    <input 
                      name="valor"
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      defaultValue={editingBill?.valor}
                      placeholder="0,00"
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Grupo</label>
                    <select 
                      name="grupo"
                      defaultValue={editingBill?.grupo || 'Geral'}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      {!GROUPS.includes(editingBill?.grupo || '') && editingBill?.grupo && (
                        <option value={editingBill.grupo}>{editingBill.grupo}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Categoria</label>
                    <select 
                      name="categoria"
                      defaultValue={editingBill?.categoria || 'Outros'}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Vencimento (Dia)</label>
                    <input 
                      name="vencimento"
                      type="number"
                      min="1"
                      max="31"
                      defaultValue={editingBill?.vencimento}
                      placeholder="Ex: 10"
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-black/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conta Parcelada?</span>
                    <input 
                      name="parcelado"
                      type="checkbox"
                      defaultChecked={editingBill?.parcelado}
                      className="w-5 h-5 accent-black"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-black/40 uppercase tracking-wider">Parcela Atual</label>
                      <input 
                        name="parcela_atual"
                        type="number"
                        defaultValue={editingBill?.parcela_atual}
                        className="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-black/40 uppercase tracking-wider">Total Parcelas</label>
                      <input 
                        name="parcela_total"
                        type="number"
                        defaultValue={editingBill?.parcela_total}
                        className="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Observações</label>
                  <textarea 
                    name="observacoes"
                    defaultValue={editingBill?.observacoes}
                    rows={2}
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <input type="hidden" name="status" defaultValue={editingBill?.status || 'pendente'} />

                <button 
                  type="submit"
                  className="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-black/90 active:scale-[0.98] transition-all"
                >
                  {editingBill ? 'Salvar Alterações' : 'Adicionar Conta'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
