import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadData from './components/UploadData';
import Reconciliation from './components/Reconciliation';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BookDemo from './components/BookDemo';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import { Invoice, Transaction, ViewState, AuditLogEntry } from './types';
import { generateDemoData } from './services/geminiService';

type AppState = 'landing' | 'login' | 'authenticated' | 'book-demo';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentView, setCurrentView] = useState<ViewState>('upload');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Initialize Dark Mode based on system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update HTML class for Tailwind Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUploadInvoices = (newInvoices: Invoice[]) => {
    setInvoices(prev => [...prev, ...newInvoices]);
  };

  const handleUploadTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const handleReconcile = (invoiceId: string, transactionId: string) => {
    // Optimistic Update
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
    ));

    setTransactions(prev => prev.map(txn => 
      txn.id === transactionId ? { ...txn, isReconciled: true, matchedInvoiceId: invoiceId } : txn
    ));

    // Add to Audit Log
    const newLog: AuditLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'Match',
      details: `Reconciled Invoice ${invoiceId} against Transaction ${transactionId}`,
      user: 'Current User' 
    };
    setAuditLog(prev => [newLog, ...prev]);
  };

  const handleGenerateDemoData = async () => {
    setIsDemoLoading(true);
    try {
      const { invoices: demoInvoices, transactions: demoTransactions } = await generateDemoData();
      if (demoInvoices.length > 0) {
        setInvoices(demoInvoices);
        setTransactions(demoTransactions);
        if (currentView === 'upload') {
            setCurrentView('reconciliation');
        }
      } else {
        alert('Failed to generate demo data. Check API Key.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate demo data.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // --- Routing Logic ---
  if (appState === 'landing') {
    return (
      <LandingPage 
        onLoginClick={() => setAppState('login')} 
        onBookDemoClick={() => setAppState('book-demo')}
      />
    );
  }

  if (appState === 'book-demo') {
    return (
      <BookDemo onBack={() => setAppState('landing')} />
    );
  }

  if (appState === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={() => setAppState('authenticated')} 
        onBack={() => setAppState('landing')}
      />
    );
  }

  // --- Authenticated App Layout ---
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            invoices={invoices} 
            transactions={transactions} 
            onGenerateDemoData={handleGenerateDemoData}
            isDemoLoading={isDemoLoading}
          />
        );
      case 'upload':
        return (
          <UploadData 
            existingInvoices={invoices}
            onUploadInvoices={handleUploadInvoices}
            onUploadTransactions={handleUploadTransactions}
            onViewChange={setCurrentView}
            onGenerateDemoData={handleGenerateDemoData}
            isDemoLoading={isDemoLoading}
          />
        );
      case 'reconciliation':
        return (
          <Reconciliation 
            invoices={invoices} 
            transactions={transactions}
            auditLog={auditLog}
            onReconcile={handleReconcile}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard invoices={invoices} transactions={transactions} onGenerateDemoData={handleGenerateDemoData} isDemoLoading={isDemoLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="flex-1 overflow-auto relative">
        {/* Background Gradients for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 pointer-events-none -z-10" />
        
        {renderContent()}
      </main>

      {/* Floating Chat Assistant (MCP Implementation) */}
      <ChatAssistant 
        invoices={invoices} 
        transactions={transactions} 
        currentView={currentView}
        onNavigate={setCurrentView}
      />
    </div>
  );
};

export default App;