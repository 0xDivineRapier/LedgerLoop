
export interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Pending';
  description?: string; // Helpful for AI matching
}

export interface ScannedInvoice extends Invoice {
  confidence: 'high' | 'medium' | 'low';
  issue?: string; // e.g. "Blurry", "Missing Date"
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  referenceNumber: string;
  isReconciled: boolean;
  matchedInvoiceId?: string;
}

export interface MatchSuggestion {
  invoiceId: string;
  transactionId: string;
  confidence: number;
  reasoning: string;
}

export interface ToDoItem {
  id: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Reconciliation' | 'Collection' | 'Review';
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'Match' | 'Unmatch';
  details: string;
  user: string;
}

export type ViewState = 'dashboard' | 'upload' | 'reconciliation' | 'settings';
export type ERPProvider = 'odoo' | 'netsuite' | 'sap' | 'xero';

export interface LedgerContextType {
  invoices: Invoice[];
  transactions: Transaction[];
  addInvoices: (invoices: Invoice[]) => void;
  addTransactions: (transactions: Transaction[]) => void;
  markReconciled: (invoiceId: string, transactionId: string) => void;
  resetData: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isToolCall?: boolean;
  toolName?: string;
}
