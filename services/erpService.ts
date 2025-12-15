import { Invoice, ERPProvider } from '../types';

/**
 * Simulates calling the backend adapter for specific ERPs.
 * In production, this would route to: /api/erp/sync?provider={source}
 */
export const fetchERPInvoices = async (source: ERPProvider): Promise<Invoice[]> => {
  // Simulate network latency (randomized for realism)
  const delay = Math.floor(Math.random() * 1000) + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Return distinct datasets based on the source
  switch (source) {
    case 'odoo':
      return [
        { 
          id: 'ODOO-2024-8821', 
          customerName: 'MegaCorp Industries', 
          amount: 12500.00, 
          dueDate: '2024-11-01', 
          status: 'Unpaid',
          description: 'Consulting Services Q4' 
        },
        { 
          id: 'ODOO-2024-8822', 
          customerName: 'StartUp Dynamics', 
          amount: 4200.50, 
          dueDate: '2024-11-05', 
          status: 'Unpaid',
          description: 'Software License Renewal' 
        },
      ];
    
    case 'netsuite':
      return [
        { 
          id: 'NET-99201', 
          customerName: 'Oracle Systems Inc', 
          amount: 25000.00, 
          dueDate: '2024-10-30', 
          status: 'Unpaid',
          description: 'Cloud Infrastructure Q3' 
        },
        { 
          id: 'NET-99202', 
          customerName: 'BlueSky Ventures', 
          amount: 3150.00, 
          dueDate: '2024-11-10', 
          status: 'Unpaid',
          description: 'Venture Consulting' 
        },
      ];

    case 'sap':
      return [
        { 
          id: 'SAP-1000293', 
          customerName: 'Global Manufacturing GmbH', 
          amount: 154200.00, 
          dueDate: '2024-11-15', 
          status: 'Unpaid',
          description: 'Bulk Machinery Order' 
        },
      ];

    case 'xero':
      return [
        { 
          id: 'XERO-INV-001', 
          customerName: 'Local Coffee Roasters', 
          amount: 450.00, 
          dueDate: '2024-10-28', 
          status: 'Unpaid',
          description: 'Monthly Bean Supply' 
        },
        { 
          id: 'XERO-INV-002', 
          customerName: 'Design Studio 4', 
          amount: 1200.00, 
          dueDate: '2024-10-29', 
          status: 'Unpaid',
          description: 'Website Redesign Deposit' 
        },
      ];

    default:
      return [];
  }
};