import React, { useState } from 'react';
import { Database, Link2, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

const Settings: React.FC = () => {
  const [erpType, setErpType] = useState('odoo');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');
  const [config, setConfig] = useState({
    url: '',
    db: '',
    username: '',
    apiKey: ''
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionStatus('connecting');
    
    // Simulate the OdooAdapter connection process
    setTimeout(() => {
      // For demo purposes, if URL is filled, we assume success
      if (config.url) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
      }
    }, 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Connect LedgerLoop to your ERP system for automatic synchronization.</p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">ERP Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure your adapter settings.</p>
          </div>
        </div>

        <div className="p-8">
            <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                        {erpType === 'odoo' ? (
                            <span className="font-bold text-slate-700 dark:text-slate-200">Odoo</span>
                        ) : (
                            <Database className="w-6 h-6 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">Connection Status</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {connectionStatus === 'connected' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Connected
                                </span>
                            )}
                            {connectionStatus === 'connecting' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                                </span>
                            )}
                            {connectionStatus === 'failed' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" /> Sync Failed
                                </span>
                            )}
                            {connectionStatus === 'disconnected' && (
                                <span className="text-xs text-slate-500">Not connected</span>
                            )}
                        </div>
                    </div>
                </div>
                {connectionStatus === 'connected' && (
                    <button 
                        onClick={() => setConnectionStatus('disconnected')}
                        className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                    >
                        Disconnect
                    </button>
                )}
            </div>

            <form onSubmit={handleConnect} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ERP Provider</label>
                    <select 
                        value={erpType}
                        onChange={(e) => setErpType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                        <option value="odoo">Odoo (XML-RPC)</option>
                        <option value="netsuite">NetSuite (Coming Soon)</option>
                        <option value="sap">SAP S/4HANA (Coming Soon)</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Instance URL</label>
                        <input 
                            type="url" 
                            placeholder="https://mycompany.odoo.com"
                            value={config.url}
                            onChange={(e) => setConfig({...config, url: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Database Name</label>
                        <input 
                            type="text" 
                            placeholder="my_db_prod"
                            value={config.db}
                            onChange={(e) => setConfig({...config, db: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                             disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username / Email</label>
                        <input 
                            type="text" 
                            placeholder="admin@example.com"
                            value={config.username}
                            onChange={(e) => setConfig({...config, username: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                             disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Key / Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••••••••••"
                            value={config.apiKey}
                            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                             disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-100"
                    >
                        {connectionStatus === 'connecting' ? 'Testing Connection...' : <><Link2 className="w-5 h-5" /> Connect ERP</>}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;