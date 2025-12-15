import React, { useState, useMemo } from 'react';
import { Invoice, Transaction, MatchSuggestion, AuditLogEntry } from '../types';
import { getReconciliationSuggestions } from '../services/geminiService';
import { Check, X, ArrowRightLeft, Sparkles, RefreshCw, Zap, CheckCircle2, Search, ArrowUpDown, Filter, Calendar, History, User } from 'lucide-react';

interface ReconciliationProps {
  invoices: Invoice[];
  transactions: Transaction[];
  auditLog: AuditLogEntry[];
  onReconcile: (invoiceId: string, transactionId: string) => void;
}

const Reconciliation: React.FC<ReconciliationProps> = ({ invoices, transactions, auditLog, onReconcile }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter/Sort State
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceSort, setInvoiceSort] = useState<'date-asc' | 'date-desc' | 'amount-desc' | 'amount-asc'>('date-asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Unpaid' | 'Pending'>('Unpaid');

  // Filter lists to only show unreconciled transactions (Transactions don't have complex status yet)
  const unreconciledTransactions = transactions.filter(t => !t.isReconciled);

  // Derived state for Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(i => {
        // 1. Status Filter (Always exclude 'Paid' for reconciliation view)
        if (i.status === 'Paid') return false;
        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
        
        // 2. Search Filter
        const searchLower = invoiceSearch.toLowerCase();
        return (
          i.customerName.toLowerCase().includes(searchLower) || 
          i.id.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        // 3. Sorting
        switch (invoiceSort) {
          case 'date-asc': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'date-desc': return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          case 'amount-desc': return b.amount - a.amount;
          case 'amount-asc': return a.amount - b.amount;
          default: return 0;
        }
      });
  }, [invoices, invoiceSearch, invoiceSort, statusFilter]);

  const handleReconcileNow = async () => {
    setIsAiLoading(true);
    setSuggestions([]); // Clear previous
    try {
      const matches = await getReconciliationSuggestions(invoices, transactions);
      setSuggestions(matches);
    } catch (e) {
      console.error("Reconciliation Error", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const executeMatch = () => {
    if (selectedInvoice && selectedTransaction) {
      onReconcile(selectedInvoice, selectedTransaction);
      setSelectedInvoice(null);
      setSelectedTransaction(null);
      // Remove executed match from suggestions if present
      setSuggestions(prev => prev.filter(s => s.invoiceId !== selectedInvoice));
    }
  };

  const confirmSuggestion = (match: MatchSuggestion) => {
    onReconcile(match.invoiceId, match.transactionId);
    setSuggestions(prev => prev.filter(s => s.invoiceId !== match.invoiceId));
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-screen flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reconciliation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Match your outstanding invoices with bank transactions.</p>
        </div>
        <div className="flex gap-3">
             <button 
            onClick={executeMatch}
            disabled={!selectedInvoice || !selectedTransaction}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Match Selected</span>
          </button>
          <button 
            onClick={handleReconcileNow}
            disabled={isAiLoading || filteredInvoices.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md disabled:opacity-70 group"
          >
            {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            <span>Reconcile Now</span>
          </button>
        </div>
      </header>

      {/* Suggested Matches Panel */}
      {suggestions.length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex-shrink-0 animate-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Suggested Matches</h3>
                <p className="text-xs text-slate-500">Review and confirm the automated matches found.</p>
             </div>
             <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium border border-slate-200 dark:border-slate-600">
                {suggestions.length} pending
             </span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {suggestions.map((match, idx) => {
              const inv = invoices.find(i => i.id === match.invoiceId);
              const txn = transactions.find(t => t.id === match.transactionId);
              if (!inv || !txn) return null;
              
              const isHardMatch = match.confidence === 100;

              return (
                <div key={idx} className={`flex-shrink-0 w-80 p-4 rounded-xl border relative group transition-all ${
                  isHardMatch 
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                     {isHardMatch ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-md">
                            <Zap className="w-3 h-3 fill-current" />
                            Hard Match
                        </span>
                     ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-2 py-1 rounded-md">
                            <Sparkles className="w-3 h-3" />
                            {match.confidence}% Vibe Match
                        </span>
                     )}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Invoice</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{inv.customerName}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Transaction</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[120px]" title={txn.description}>{txn.description}</span>
                    </div>
                     <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">Amounts</span>
                        <div className="text-right">
                            <div className="font-mono font-medium">${inv.amount.toLocaleString()}</div>
                            {!isHardMatch && (
                                <div className="text-xs text-rose-500">Diff: ${(Math.abs(inv.amount - txn.amount)).toFixed(2)}</div>
                            )}
                        </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic mb-4 line-clamp-2 min-h-[2.5em]">{match.reasoning}</p>

                  <button 
                    onClick={() => confirmSuggestion(match)} 
                    className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        isHardMatch 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                        : 'bg-slate-900 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Confirm
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 mb-6">
        
        {/* Invoices Column */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
          {/* Invoice Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
             <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-slate-700 dark:text-slate-200">Open Invoices</h3>
                 <span className="text-xs font-mono text-slate-500">{filteredInvoices.length} items</span>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search customer or ID..." 
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-2">
                     <div className="relative">
                         <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700 dark:text-slate-200"
                         >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Pending">Pending</option>
                            <option value="all">All Open</option>
                         </select>
                         <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                         <ArrowUpDown className="w-3 h-3 absolute right-3 top-3 text-slate-400 pointer-events-none opacity-50" />
                    </div>
                     <div className="relative">
                         <select 
                            value={invoiceSort}
                            onChange={(e) => setInvoiceSort(e.target.value as any)}
                            className="appearance-none pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700 dark:text-slate-200"
                         >
                            <option value="date-asc">Oldest First</option>
                            <option value="date-desc">Newest First</option>
                            <option value="amount-desc">Highest Amount</option>
                            <option value="amount-asc">Lowest Amount</option>
                         </select>
                         <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                         <ArrowUpDown className="w-3 h-3 absolute right-3 top-3 text-slate-400 pointer-events-none opacity-50" />
                    </div>
                </div>
             </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredInvoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                    <p>No invoices match criteria</p>
                </div>
            ) : (
                filteredInvoices.map(inv => (
                <div 
                    key={inv.id}
                    onClick={() => setSelectedInvoice(selectedInvoice === inv.id ? null : inv.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                    selectedInvoice === inv.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">#{inv.id}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">${inv.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-slate-400">Due: {inv.dueDate}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        inv.status === 'Pending' 
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                    }`}>
                        {inv.status}
                    </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Transactions Column */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 h-[88px] box-border">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Bank Transactions</h3>
            <span className="text-xs font-mono text-slate-500">{unreconciledTransactions.length} items</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {unreconciledTransactions.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                    <p>All matched</p>
                </div>
            ) : (
                unreconciledTransactions.map(txn => (
                <div 
                    key={txn.id}
                    onClick={() => setSelectedTransaction(selectedTransaction === txn.id ? null : txn.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                    selectedTransaction === txn.id 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-400 shadow-sm ring-1 ring-emerald-500' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{txn.description}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{txn.date}</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+${txn.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-slate-400 font-mono">{txn.referenceNumber}</span>
                    <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded-full font-medium">Unreconciled</span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Log Section */}
      {auditLog.length > 0 && (
        <div className="mt-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex-shrink-0 max-h-64 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Recent Activity Log</h3>
            </div>
            <div className="overflow-y-auto p-0">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 font-medium w-32">Time</th>
                            <th className="px-4 py-2 font-medium w-24">Action</th>
                            <th className="px-4 py-2 font-medium">Details</th>
                            <th className="px-4 py-2 font-medium w-32">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {auditLog.map(entry => (
                            <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">
                                    {entry.timestamp.toLocaleTimeString()}
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        entry.action === 'Match' 
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        {entry.action}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-slate-700 dark:text-slate-300 truncate max-w-md">
                                    {entry.details}
                                </td>
                                <td className="px-4 py-2 text-slate-500 text-xs flex items-center gap-1.5">
                                    <User className="w-3 h-3" />
                                    {entry.user}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;