import React, { useMemo, useState } from 'react';
import { Invoice, Transaction, ToDoItem } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Wallet, Activity, AlertTriangle, 
  ArrowUpRight, CheckCircle2, Sparkles, ClipboardList, Loader2, ArrowRight
} from 'lucide-react';
import { generateSmartToDoList } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  transactions: Transaction[];
  onGenerateDemoData: () => void;
  isDemoLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, transactions, onGenerateDemoData, isDemoLoading }) => {
  const [toDoList, setToDoList] = useState<ToDoItem[]>([]);
  const [isGeneratingToDo, setIsGeneratingToDo] = useState(false);

  // --- Metric Calculations ---
  
  // 1. Cash Position: Total value of all matched (reconciled) transactions
  const cashPosition = useMemo(() => 
    transactions
      .filter(t => t.isReconciled)
      .reduce((sum, t) => sum + t.amount, 0),
  [transactions]);

  // 2. Outstanding Receivables: Total value of unpaid invoices
  const outstandingReceivables = useMemo(() => 
    invoices
      .filter(i => i.status === 'Unpaid')
      .reduce((sum, i) => sum + i.amount, 0),
  [invoices]);

  // 3. Reconciliation Health: % of transactions matched
  const reconciliationHealth = useMemo(() => {
    if (transactions.length === 0) return 0;
    const reconciledCount = transactions.filter(t => t.isReconciled).length;
    return Math.round((reconciledCount / transactions.length) * 100);
  }, [transactions]);

  // 4. Anomaly List: Unreconciled transactions with duplicate amounts on the same day
  const anomalies = useMemo(() => {
    const unreconciled = transactions.filter(t => !t.isReconciled);
    const groups: Record<string, Transaction[]> = {};

    unreconciled.forEach(t => {
      const key = `${t.date}-${t.amount}`; // Group key
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    // Return groups that have duplicates (length > 1)
    return Object.values(groups)
      .filter(group => group.length > 1)
      .flat();
  }, [transactions]);

  // Chart Data: Aggregate by Date for a Trend View
  const chartData = useMemo(() => {
    const allDates = new Set([
      ...invoices.map(i => i.dueDate),
      ...transactions.map(t => t.date)
    ].filter(d => d).sort());

    return Array.from(allDates).map(date => ({
      date,
      invoiced: invoices.filter(i => i.dueDate === date).reduce((sum, i) => sum + i.amount, 0),
      collected: transactions.filter(t => t.date === date && t.isReconciled).reduce((sum, t) => sum + t.amount, 0),
    }));
  }, [invoices, transactions]);

  const handleGenerateToDo = async () => {
    setIsGeneratingToDo(true);
    try {
        const tasks = await generateSmartToDoList(invoices, transactions);
        setToDoList(tasks);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingToDo(false);
    }
  };

  // --- Empty State (Get Started) ---
  if (invoices.length === 0 && transactions.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Welcome to LedgerLoop</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg mb-8">
                Your AI-powered financial reconciliation assistant. Upload your data or generate a demo to get started.
            </p>
            <button 
                onClick={onGenerateDemoData}
                disabled={isDemoLoading}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
            >
                {isDemoLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                <span>Get Started with Demo Data</span>
            </button>
        </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            High-level metrics and reconciliation status.
          </p>
        </div>
        <div className="flex gap-2">
           {/* Placeholder for future top-level actions */}
        </div>
      </header>

      {/* --- Key Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cash Position */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Cash Position</h3>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              ${cashPosition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Verified & Reconciled
            </p>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding Receivables</h3>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              ${outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
              <Activity className="w-3 h-3" />
              Pending Collection
            </p>
          </div>
        </div>

        {/* Reconciliation Health */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Reconciliation Health</h3>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{reconciliationHealth}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Progress</span>
              <span>{transactions.filter(t => t.isReconciled).length} / {transactions.length} txns</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${reconciliationHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Financial Trend Chart --- */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Activity</h3>
                    <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span className="text-xs text-slate-500">Invoiced</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-xs text-slate-500">Collected</span>
                    </div>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="invoiced" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorInvoiced)" />
                        <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
             {/* --- AI Smart To-Do List --- */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                             <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white">AI Assistant Plan</h3>
                    </div>
                    <button 
                        onClick={handleGenerateToDo}
                        disabled={isGeneratingToDo}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                       {isGeneratingToDo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                       {toDoList.length > 0 ? 'Refresh Plan' : 'Generate Daily Plan'}
                    </button>
                </div>
                <div className="p-4">
                    {toDoList.length === 0 ? (
                         <div className="text-center py-8 px-4 text-slate-400 dark:text-slate-500 text-sm">
                            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p>Click "Generate Daily Plan" to let the AI analyze your ledger and prioritize your work.</p>
                         </div>
                    ) : (
                        <div className="space-y-3">
                            {toDoList.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        item.priority === 'High' ? 'bg-rose-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.task}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                 {item.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- Anomaly List --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-rose-50/50 dark:bg-rose-900/10">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Anomaly Detected</h3>
            </div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
              Suspicious unreconciled transactions found.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
            {anomalies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                <CheckCircle2 className="w-12 h-12 mb-3 opacity-20 text-emerald-500" />
                <p className="text-sm font-medium">No anomalies detected</p>
                <p className="text-xs opacity-70">Your books look clean.</p>
              </div>
            ) : (
              anomalies.map((txn, idx) => (
                <div key={`${txn.id}-${idx}`} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 group hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                  <div className="mt-1 min-w-[4px] h-8 bg-rose-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate pr-2">{txn.description}</h4>
                      <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">
                        ${txn.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{txn.date}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500 bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">Duplicate</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {anomalies.length > 0 && (
             <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  View all {anomalies.length} issues
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;