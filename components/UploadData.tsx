import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, AlertTriangle, Trash2, Check, ArrowRight, Database, RefreshCw, X, Box, Globe, Layers, Server } from 'lucide-react';
import { Invoice, Transaction, ScannedInvoice, ERPProvider } from '../types';
import { parseInvoicePDF } from '../services/geminiService';
import { fetchERPInvoices } from '../services/erpService';

interface UploadDataProps {
  existingInvoices: Invoice[]; // Needed for deduplication
  onUploadInvoices: (invoices: Invoice[]) => void;
  onUploadTransactions: (transactions: Transaction[]) => void;
  onViewChange: (view: any) => void;
  onGenerateDemoData: () => void;
  isDemoLoading: boolean;
}

interface Integration {
  id: ERPProvider;
  name: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected';
  color: string;
}

const UploadData: React.FC<UploadDataProps> = ({ 
  existingInvoices,
  onUploadInvoices, 
  onUploadTransactions, 
  onViewChange,
  onGenerateDemoData,
  isDemoLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingSource, setSyncingSource] = useState<ERPProvider | null>(null);
  const [scannedInvoices, setScannedInvoices] = useState<ScannedInvoice[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({ show: false, message: '', type: 'info' });

  const integrations: Integration[] = [
    { id: 'odoo', name: 'Odoo ERP', icon: Layers, status: 'connected', color: 'text-purple-600' },
    { id: 'netsuite', name: 'NetSuite', icon: Database, status: 'connected', color: 'text-blue-600' },
    { id: 'sap', name: 'SAP S/4HANA', icon: Server, status: 'connected', color: 'text-blue-800' },
    { id: 'xero', name: 'Xero', icon: Globe, status: 'connected', color: 'text-sky-500' },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent, type: 'invoice' | 'transaction') => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && type === 'invoice' && file.type === 'application/pdf') {
      await processInvoiceFile(file);
    } else if (file) {
      // Fallback for transactions or non-pdf invoices (simulated)
      simulateFileUpload(type);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'transaction') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (type === 'invoice' && file.type === 'application/pdf') {
        await processInvoiceFile(file);
      } else {
        simulateFileUpload(type);
      }
    }
  };

  const processInvoiceFile = async (file: File) => {
    setIsLoading(true);
    setProcessingStatus('AI extraction in progress...');
    try {
      const extracted = await parseInvoicePDF(file);
      if (extracted) {
        setScannedInvoices(prev => [...prev, extracted]);
      } else {
        showToast("Failed to extract data. Please try another file.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Error processing file.", 'error');
    } finally {
      setIsLoading(false);
      setProcessingStatus('');
    }
  };

  const simulateFileUpload = (type: 'invoice' | 'transaction') => {
    setIsLoading(true);
    setProcessingStatus('Parsing CSV...');
    setTimeout(() => {
      setIsLoading(false);
      setProcessingStatus('');
      // Generate some basic mock data to simulate "parsing"
      if (type === 'invoice') {
        const mockInvoices: Invoice[] = [
          { id: 'INV-2024-001', customerName: 'Acme Corp', amount: 1500.00, dueDate: '2024-10-15', status: 'Unpaid' },
          { id: 'INV-2024-002', customerName: 'Globex Inc', amount: 2350.50, dueDate: '2024-10-18', status: 'Unpaid' },
          { id: 'INV-2024-003', customerName: 'Soylent Corp', amount: 500.00, dueDate: '2024-10-20', status: 'Unpaid' },
        ];
        onUploadInvoices(mockInvoices);
        showToast(`Successfully parsed 3 invoices from file.`, 'success');
      } else {
        const mockTransactions: Transaction[] = [
          { id: 'TXN-99881', date: '2024-10-16', description: 'Payment from Acme', amount: 1500.00, referenceNumber: 'REF-ACME', isReconciled: false },
          { id: 'TXN-99882', date: '2024-10-19', description: 'Globex Services Payment', amount: 2350.00, referenceNumber: 'WIRE-202', isReconciled: false },
          { id: 'TXN-99883', date: '2024-10-21', description: 'Unknown Deposit', amount: 500.00, referenceNumber: 'UNK-111', isReconciled: false },
        ];
        onUploadTransactions(mockTransactions);
        showToast(`Successfully parsed 3 transactions from file.`, 'success');
      }
    }, 1500);
  };

  const handleSyncERP = async (source: ERPProvider) => {
    setSyncingSource(source);
    try {
      const fetchedInvoices = await fetchERPInvoices(source);
      
      // Filter out invoices that already exist
      const newInvoices = fetchedInvoices.filter(
        fetched => !existingInvoices.some(existing => existing.id === fetched.id)
      );

      if (newInvoices.length > 0) {
        onUploadInvoices(newInvoices);
        showToast(`Synced ${newInvoices.length} invoices from ${source.toUpperCase()}.`, 'success');
      } else {
        showToast(`Sync complete. No new invoices in ${source.toUpperCase()}.`, 'info');
      }
    } catch (error) {
      console.error(error);
      showToast(`Failed to sync with ${source}.`, 'error');
    } finally {
      setSyncingSource(null);
    }
  };

  const approveInvoice = (index: number) => {
    const invoice = scannedInvoices[index];
    // Remove confidence/issue props before saving
    const { confidence, issue, ...cleanInvoice } = invoice;
    onUploadInvoices([cleanInvoice]);
    setScannedInvoices(prev => prev.filter((_, i) => i !== index));
    showToast("Invoice approved and added to ledger.", 'success');
  };

  const discardInvoice = (index: number) => {
    setScannedInvoices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 
          toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-rose-500 text-rose-600 dark:text-rose-400' :
          'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 dark:text-indigo-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
           toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
           <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium text-slate-900 dark:text-white">{toast.message}</span>
          <button onClick={() => setToast(prev => ({...prev, show: false}))} className="ml-4 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Financial Data</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2">Import your bank statements and outstanding invoices.</p>
        </div>
      </div>

      {/* Integration Hub Card */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
             <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
           </div>
           <div>
             <h3 className="font-bold text-slate-900 dark:text-white text-lg">ERP Integration Hub</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">
               Sync open invoices directly from your connected providers.
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((erp) => (
             <div key={erp.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm ${erp.color}`}>
                     <erp.icon className="w-5 h-5" />
                   </div>
                   <span className="font-semibold text-slate-900 dark:text-white">{erp.name}</span>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected"></div>
               </div>
               
               <button 
                  onClick={() => handleSyncERP(erp.id)}
                  disabled={syncingSource !== null}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 hover:border-indigo-600 transition-all disabled:opacity-50"
               >
                  {syncingSource === erp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {syncingSource === erp.id ? 'Syncing...' : 'Sync Now'}
               </button>
             </div>
          ))}
        </div>

        {/* Dedicated SAP Action as requested */}
        <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4">
          <button
            onClick={() => handleSyncERP('sap')}
            disabled={syncingSource !== null}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {syncingSource === 'sap' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
            Sync from SAP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Invoice Upload */}
        <div 
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group cursor-pointer relative overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'invoice')}
        >
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            onChange={(e) => handleFileChange(e, 'invoice')}
            accept=".pdf"
          />
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-full group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Invoices</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Drag PDF files here</p>
            </div>
            <div className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered Extraction
            </div>
          </div>
        </div>

        {/* Transaction Upload */}
        <div 
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors group cursor-pointer relative overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'transaction')}
        >
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={(e) => handleFileChange(e, 'transaction')}
            accept=".csv,.xls"
          />
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-slate-700 rounded-full group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Bank Statements</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Drag CSV files here</p>
            </div>
             <div className="text-xs text-slate-400 border px-3 py-1 rounded-full">Supports Bank CSV Formats</div>
          </div>
        </div>
      </div>

      {/* Quick Start / Demo Data Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Don't have files ready?
            </h3>
            <p className="text-indigo-700/80 dark:text-indigo-300/80 mt-2 max-w-lg leading-relaxed">
                Generate a realistic dataset with AI. Includes messy transaction descriptions, partial payments, and tricky reconciliation scenarios to test the engine.
            </p>
        </div>
        <button 
            onClick={onGenerateDemoData}
            disabled={isDemoLoading || isLoading}
            className="relative z-10 whitespace-nowrap flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
        >
            {isDemoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>Populate Demo Data</span>
            {!isDemoLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Review Section */}
      {scannedInvoices.length > 0 && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
             Review Scanned Invoices
             <span className="text-sm font-normal text-slate-400 ml-2">({scannedInvoices.length} pending approval)</span>
           </h3>
           
           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm">
                   <tr>
                     <th className="p-4 font-medium">Status</th>
                     <th className="p-4 font-medium">Invoice #</th>
                     <th className="p-4 font-medium">Customer</th>
                     <th className="p-4 font-medium">Date</th>
                     <th className="p-4 font-medium">Amount</th>
                     <th className="p-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {scannedInvoices.map((inv, idx) => (
                     <tr key={idx} className={`group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${inv.confidence === 'low' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                       <td className="p-4 align-middle">
                         {inv.confidence === 'high' && (
                           <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                             <CheckCircle2 className="w-4 h-4" />
                             <span>High Confidence</span>
                           </div>
                         )}
                         {inv.confidence === 'medium' && (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Check Details</span>
                            </div>
                         )}
                         {inv.confidence === 'low' && (
                            <div className="flex flex-col gap-1 text-rose-600 dark:text-rose-400 text-xs font-medium">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Review Needed</span>
                              </div>
                              {inv.issue && <span className="opacity-80 italic">{inv.issue}</span>}
                            </div>
                         )}
                       </td>
                       <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300">{inv.id}</td>
                       <td className="p-4 font-medium text-slate-900 dark:text-white">{inv.customerName}</td>
                       <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{inv.dueDate}</td>
                       <td className="p-4 font-bold text-slate-900 dark:text-slate-100">${inv.amount.toLocaleString()}</td>
                       <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => discardInvoice(idx)}
                             className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                             title="Discard"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => approveInvoice(idx)}
                             className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
                             title="Approve"
                           >
                             <Check className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-300 max-w-sm text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{processingStatus || 'Processing...'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ledger Larry (AI Junior Accountant) is reading your documents.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadData;