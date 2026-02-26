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
  RefreshCw,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bill, Group, Status, MonthlyStats } from './types';
import { SEED_DATA, GROUPS, MONTHS } from './constants';
import { supabase } from './lib/supabase';

const LOCAL_STORAGE_KEY = 'gestor_contas_data';
const GROUPS_STORAGE_KEY = 'gestor_contas_groups';

export default function App() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [groups, setGroups] = useState<string[]>(GROUPS);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
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

    const savedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups);
      // Ensure 'Mercado' is present if it was just added to defaults
      if (!parsedGroups.includes('Mercado')) {
        parsedGroups.push('Mercado');
      }
      setGroups(parsedGroups);
    }

    fetchBillsFromSupabase();
  }, []);

  // Save to LocalStorage whenever bills change
  useEffect(() => {
    if (bills.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bills));
    }
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

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
      } else {
        // Supabase is empty. Try to push local data if it exists.
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          const localBills = JSON.parse(savedData);
          if (localBills.length > 0) {
            const { error: insertError } = await supabase.from('bills').insert(localBills);
            if (insertError) {
              console.error('Error migrating local data to Supabase:', insertError);
              // If migration fails, just keep local data for now
            } else {
              setLastSync(new Date());
            }
          }
        } else {
          await seedSupabase();
        }
      }
    } catch (err: any) {
      console.error('Error fetching from Supabase:', err);
      setSyncError('Erro de conexão com a nuvem');
    } finally {
      setIsSyncing(false);
    }
  };

  const forceSyncAll = async () => {
    if (bills.length === 0) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const { error } = await supabase.from('bills').upsert(bills);
      if (error) throw error;
      setLastSync(new Date());
      alert('Sincronização completa com sucesso!');
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setSyncError('Erro ao sincronizar tudo');
      alert('Erro ao sincronizar: ' + (err.message || 'Verifique sua conexão'));
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
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('bills')
        .upsert(bill);
      if (error) throw error;
      setLastSync(new Date());
    } catch (err) {
      console.error('Error syncing bill:', err);
      setSyncError('Erro ao salvar na nuvem');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteBillFromSupabase = async (id: string) => {
    setIsSyncing(true);
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
    } finally {
      setIsSyncing(false);
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
    const monthBills = bills.filter(b => b.mes_ref === selectedMonth && b.grupo !== 'Mercado');
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
    const isFixa = formData.get('fixa') === 'on';
    const parcelaAtual = formData.get('parcela_atual') ? parseInt(formData.get('parcela_atual') as string) : 1;
    const parcelaTotal = formData.get('parcela_total') ? parseInt(formData.get('parcela_total') as string) : 1;
    
    // Helper for unique ID generation (robust for mobile)
    const generateId = () => {
      return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
    };

    const valorStr = (formData.get('valor') as string).replace(',', '.');
    const valor = parseFloat(valorStr);

    if (isNaN(valor)) {
      alert('Por favor, insira um valor válido para o valor.');
      return;
    }
    
    const baseBill: Partial<Bill> = {
      nome: formData.get('nome') as string,
      valor: valor,
      grupo: formData.get('grupo') as string,
      parcelado: isParcelado,
      fixa: isFixa,
      status: (formData.get('status') as Status) || 'pendente',
      observacoes: formData.get('observacoes') as string,
    };

    // Store a reference to the bill being edited before clearing state
    const currentEditingBill = editingBill;

    // Start sync indicator immediately
    setIsSyncing(true);
    setSyncError(null);

    // Optimistic update: close modal and update local state immediately
    setIsModalOpen(false);
    setEditingBill(null);

    try {
      if (currentEditingBill) {
        // 1. Update the current bill and all future siblings in the series
        const updatedBills = bills.map(b => {
          const isFutureSibling = b.nome === currentEditingBill.nome && 
                                 b.grupo === currentEditingBill.grupo && 
                                 b.mes_ref >= currentEditingBill.mes_ref;
          
          if (isFutureSibling) {
            return {
              ...b,
              nome: baseBill.nome!,
              valor: baseBill.valor!,
              grupo: baseBill.grupo!,
              fixa: baseBill.fixa!,
              observacoes: baseBill.observacoes,
            };
          }
          return b;
        });

        const finalBillsToAdd: Bill[] = [];
        if (isFixa) {
          const startIndex = MONTHS.findIndex(m => m.value === currentEditingBill.mes_ref);
          const monthsToApply = startIndex !== -1 ? MONTHS.slice(startIndex + 1) : [];
          
          monthsToApply.forEach(m => {
            const alreadyExists = updatedBills.some(b => 
              b.nome === baseBill.nome && 
              b.grupo === baseBill.grupo && 
              b.mes_ref === m.value
            );
            
            if (!alreadyExists) {
              finalBillsToAdd.push({
                ...baseBill,
                id: generateId(),
                mes_ref: m.value,
                status: 'pendente',
              } as Bill);
            }
          });
        }

        const finalBillsState = [...updatedBills, ...finalBillsToAdd];
        setBills(finalBillsState);
        
        const billsToUpsert = finalBillsState.filter(b => 
          b.nome === baseBill.nome && 
          b.grupo === baseBill.grupo && 
          b.mes_ref >= currentEditingBill.mes_ref
        );

        const { error } = await supabase.from('bills').upsert(billsToUpsert);
        if (error) throw error;
        setLastSync(new Date());
      } else {
        // Adding new bill(s)
        const billsToAdd: Bill[] = [];
        
        if (isFixa) {
          const startIndex = MONTHS.findIndex(m => m.value === selectedMonth);
          const monthsToApply = startIndex !== -1 ? MONTHS.slice(startIndex) : [{ value: selectedMonth }];
          
          monthsToApply.forEach(m => {
            const alreadyExists = bills.some(b => 
              b.nome === baseBill.nome && 
              b.grupo === baseBill.grupo && 
              b.mes_ref === m.value
            );

            if (!alreadyExists) {
              billsToAdd.push({
                ...baseBill,
                id: generateId(),
                mes_ref: m.value,
                parcela_atual: isParcelado ? parcelaAtual : undefined,
                parcela_total: isParcelado ? parcelaTotal : undefined,
              } as Bill);
            }
          });
        } else if (isParcelado && parcelaTotal > 1) {
          let currentMonth = selectedMonth;
          for (let p = parcelaAtual; p <= parcelaTotal; p++) {
            const alreadyExists = bills.some(b => 
              b.nome === baseBill.nome && 
              b.grupo === baseBill.grupo && 
              b.mes_ref === currentMonth
            );

            if (!alreadyExists) {
              billsToAdd.push({
                ...baseBill,
                id: generateId(),
                mes_ref: currentMonth,
                parcela_atual: p,
                parcela_total: parcelaTotal,
              } as Bill);
            }
            currentMonth = getNextMonth(currentMonth);
          }
        } else {
          billsToAdd.push({
            ...baseBill,
            id: generateId(),
            mes_ref: selectedMonth,
            parcela_atual: isParcelado ? parcelaAtual : undefined,
            parcela_total: isParcelado ? parcelaTotal : undefined,
          } as Bill);
        }

        if (billsToAdd.length > 0) {
          setBills(prev => [...prev, ...billsToAdd]);
          const { error } = await supabase.from('bills').insert(billsToAdd);
          if (error) throw error;
          setLastSync(new Date());
        }
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncError('Erro ao sincronizar: ' + (err.message || 'Verifique sua conexão'));
    } finally {
      setIsSyncing(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Valor', 'Grupo', 'Parcela', 'Fixa', 'Status'];
    const rows = filteredBills.map(b => [
      b.nome,
      b.valor.toFixed(2),
      b.grupo,
      b.parcelado ? `${b.parcela_atual}/${b.parcela_total}` : '-',
      b.fixa ? 'Sim' : 'Não',
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

  const handleAddGroup = () => {
    const name = prompt('Nome do novo grupo:');
    if (name && !groups.includes(name)) {
      setGroups([...groups, name]);
    }
  };

  const handleRenameGroup = (oldName: string) => {
    const newName = prompt('Novo nome para o grupo:', oldName);
    if (newName && newName !== oldName && !groups.includes(newName)) {
      // Update groups list
      setGroups(groups.map(g => g === oldName ? newName : g));
      
      // Update all bills in this group
      const updatedBills = bills.map(b => b.grupo === oldName ? { ...b, grupo: newName } : b);
      setBills(updatedBills);
      
      // Sync affected bills to Supabase
      const affectedBills = updatedBills.filter(b => b.grupo === newName);
      if (affectedBills.length > 0) {
        setIsSyncing(true);
        supabase.from('bills').upsert(affectedBills).then(({ error }) => {
          if (error) console.error('Error syncing renamed group bills:', error);
          else setLastSync(new Date());
          setIsSyncing(false);
        });
      }
    }
  };

  const handleDeleteGroup = (groupName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o grupo "${groupName}"? Todas as contas deste grupo serão excluídas.`)) {
      const billsToDelete = bills.filter(b => b.grupo === groupName);
      const remainingBills = bills.filter(b => b.grupo !== groupName);
      
      setBills(remainingBills);
      setGroups(groups.filter(g => g !== groupName));
      
      // Sync deletion to Supabase
      if (billsToDelete.length > 0) {
        const ids = billsToDelete.map(b => b.id);
        setIsSyncing(true);
        supabase.from('bills').delete().in('id', ids).then(({ error }) => {
          if (error) console.error('Error deleting group bills:', error);
          else setLastSync(new Date());
          setIsSyncing(false);
        });
      }
    }
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
              onClick={forceSyncAll}
              className={`p-2 hover:bg-black/5 rounded-full transition-colors ${syncError ? 'text-red-500' : ''}`}
              title="Sincronizar Tudo Agora"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : 'opacity-60'}`} />
            </button>
            <button 
              onClick={() => setIsGroupsModalOpen(true)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              title="Gerenciar Grupos"
            >
              <Settings className="w-5 h-5 opacity-60" />
            </button>
            <button 
              onClick={exportCSV}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              title="Exportar CSV"
            >
              <Download className="w-5 h-5 opacity-60" />
            </button>
          </div>
        </div>
        
        {/* Horizontal Month Navigation */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {MONTHS.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedMonth === m.value 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-black/5 text-black/60 hover:bg-black/10'
                }`}
              >
                {m.label}
              </button>
            ))}
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{group}</h3>
                        {group === 'Mercado' && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                            Extra
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black/40 font-medium uppercase tracking-wider">
                        Total: {formatCurrency(groupTotal)}
                        {group === 'Mercado' && <span className="ml-1 text-[10px] normal-case font-normal">(não somado ao total)</span>}
                      </p>
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
                                  {bill.fixa && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                                      Fixa
                                    </span>
                                  )}
                                  {bill.parcelado && (
                                    <span className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded font-mono text-black/60">
                                      {bill.parcela_atual}/{bill.parcela_total}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-mono text-sm ${bill.status === 'pago' ? 'text-black/40' : 'text-black'}`}>
                                {formatCurrency(bill.valor)}
                              </span>
                              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingBill(bill);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteBill(bill.id)}
                                  className="p-2 hover:bg-red-50 rounded-full text-black/40 hover:text-red-500 transition-colors"
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

                <div className="grid grid-cols-1 gap-4">
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
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">Grupo</label>
                  <select 
                    name="grupo"
                    defaultValue={editingBill?.grupo || 'Geral'}
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="p-4 bg-black/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conta Fixa?</span>
                    <input 
                      name="fixa"
                      type="checkbox"
                      defaultChecked={editingBill?.fixa}
                      className="w-5 h-5 accent-emerald-600"
                    />
                  </div>

                  <div className="border-t border-black/5 pt-4 flex items-center justify-between">
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

      {/* Groups Management Modal */}
      <AnimatePresence>
        {isGroupsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGroupsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gerenciar Grupos</h2>
                <button onClick={() => setIsGroupsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-5 h-5 opacity-40" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <button 
                  onClick={handleAddGroup}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                >
                  <Plus className="w-5 h-5" />
                  Novo Grupo
                </button>

                <div className="space-y-2">
                  {groups.map(group => (
                    <div key={group} className="flex items-center justify-between p-3 bg-black/5 rounded-xl group/item">
                      <span className="font-medium">{group}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleRenameGroup(group)}
                          className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
                          title="Renomear"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGroup(group)}
                          className="p-2 hover:bg-red-50 rounded-full text-black/40 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
