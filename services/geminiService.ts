import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Invoice, Transaction, MatchSuggestion, ScannedInvoice, ToDoItem, ChatMessage } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const parseInvoicePDF = async (file: File): Promise<ScannedInvoice | null> => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key missing");
    // Return mock data for demo purposes if no key
    return {
      id: `INV-${Math.floor(Math.random() * 1000)}`,
      customerName: "Demo Customer Inc",
      amount: Math.floor(Math.random() * 5000) + 100,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Unpaid',
      confidence: 'medium',
      issue: 'Demo Mode: API Key missing'
    } as ScannedInvoice;
  }

  try {
    const base64Data = await fileToBase64(file);

    const prompt = `
      You are a diligent junior accountant named "Ledger Larry". 
      Your task is to extract structured data from this invoice document.

      Please extract the following fields:
      1. Invoice Number (use this for 'id')
      2. Customer Name (customerName)
      3. Total Amount (amount) - numeric value only
      4. Due Date (dueDate) - format YYYY-MM-DD. If only 'Invoice Date' is present, use that.
      
      Quality Check:
      - If the document is blurry, cut off, or doesn't look like an invoice, set 'confidence' to 'low' and describe the problem in 'issue'.
      - If you are unsure about specific numbers, set 'confidence' to 'medium'.
      - Otherwise, set 'confidence' to 'high'.

      Return a JSON object matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type, // e.g., 'application/pdf' or 'image/png'
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            customerName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            dueDate: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
            issue: { type: Type.STRING },
          },
          required: ["id", "customerName", "amount", "dueDate", "confidence"],
        },
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Add default status
    return {
      ...data,
      status: 'Unpaid'
    } as ScannedInvoice;

  } catch (error) {
    console.error("Error parsing invoice PDF:", error);
    return null;
  }
};

export const getReconciliationSuggestions = async (
  invoices: Invoice[],
  transactions: Transaction[]
): Promise<MatchSuggestion[]> => {
  // 1. Filter relevant items
  const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid');
  const unreconciledTransactions = transactions.filter(t => !t.isReconciled);

  if (unpaidInvoices.length === 0 || unreconciledTransactions.length === 0) {
    return [];
  }

  const suggestions: MatchSuggestion[] = [];
  const matchedInvoiceIds = new Set<string>();
  const matchedTransactionIds = new Set<string>();

  // --- RULE 1: HARD MATCH (Local Logic) ---
  // Criteria: Exact Amount AND (Invoice ID in Description OR Reference matches Invoice ID)
  
  unpaidInvoices.forEach(inv => {
    // Try to find a hard match in transactions that aren't already matched
    const match = unreconciledTransactions.find(txn => {
      if (matchedTransactionIds.has(txn.id)) return false;

      const exactAmount = Math.abs(txn.amount - inv.amount) < 0.01;
      
      // Check if Invoice ID exists in description (case-insensitive)
      const idInDesc = txn.description.toLowerCase().includes(inv.id.toLowerCase());
      
      // Check if Reference Number matches Invoice ID
      const refMatch = txn.referenceNumber && txn.referenceNumber.toLowerCase() === inv.id.toLowerCase();

      return exactAmount && (idInDesc || refMatch);
    });

    if (match) {
      suggestions.push({
        invoiceId: inv.id,
        transactionId: match.id,
        confidence: 100,
        reasoning: "Hard Match: Exact amount and Invoice ID found in transaction details."
      });
      matchedInvoiceIds.add(inv.id);
      matchedTransactionIds.add(match.id);
    }
  });

  // --- RULE 2: VIBE MATCH (AI Logic) ---
  // Criteria: Fuzzy Name Match AND Small Variance allowed
  
  const remainingInvoices = unpaidInvoices.filter(i => !matchedInvoiceIds.has(i.id));
  const remainingTransactions = unreconciledTransactions.filter(t => !matchedTransactionIds.has(t.id));

  if (remainingInvoices.length === 0 || remainingTransactions.length === 0) {
    return suggestions; // Return hard matches if nothing left for AI
  }

  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key is missing. Returning only hard matches.");
    return suggestions;
  }

  const prompt = `
    You are an expert financial auditor reconciling a B2B ledger.
    
    Task: Find matches between 'Unpaid Invoices' and 'Unreconciled Bank Transactions' that the automated system missed.

    Matching Logic (Vibe Match):
    1. **Customer Name Matching**: Look for fuzzy matches between Invoice 'customerName' and Transaction 'description'.
       (e.g., "PT. INDO JAYA" matches "Indo Jaya Tbk" or "Transfer from I. Jaya").
    2. **Amount Variance**: Allow for small differences (e.g., bank fees, exchange rate variance, or admin fees). 
       - Variance up to ~5000 IDR (or roughly 1-2% of total) is acceptable.
       - If the amount is significantly different, do NOT match unless the reference number is explicit.
    
    Data:
    Unpaid Invoices: ${JSON.stringify(remainingInvoices.map(i => ({ id: i.id, customer: i.customerName, amount: i.amount })))}

    Unreconciled Transactions: ${JSON.stringify(remainingTransactions.map(t => ({ id: t.id, desc: t.description, amount: t.amount, ref: t.referenceNumber })))}

    Return a JSON Array of objects with:
    - invoiceId
    - transactionId
    - confidence (number 0-100)
    - reasoning (brief explanation, e.g., "Customer name match with $5 fee variance")

    Only return matches with confidence > 65.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              invoiceId: { type: Type.STRING },
              transactionId: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ["invoiceId", "transactionId", "confidence", "reasoning"],
          },
        },
      },
    });

    const aiSuggestions = JSON.parse(response.text || "[]");
    return [...suggestions, ...aiSuggestions];

  } catch (error) {
    console.error("Gemini Reconciliation Failed:", error);
    return suggestions; // Return hard matches even if AI fails
  }
};

// Robust Fallback Data to use if API Key is missing or generation fails
const FALLBACK_DEMO_DATA = {
  invoices: [
    { id: 'INV-2024-001', customerName: 'TechStart Solutions', amount: 12500.00, dueDate: '2024-10-15', status: 'Unpaid' },
    { id: 'INV-2024-002', customerName: 'GreenLeaf Logistics', amount: 4200.50, dueDate: '2024-10-18', status: 'Unpaid' },
    { id: 'INV-2024-003', customerName: 'Quantum Systems', amount: 8900.00, dueDate: '2024-10-20', status: 'Unpaid' },
    { id: 'INV-2024-004', customerName: 'BlueSky Ventures', amount: 3150.00, dueDate: '2024-10-22', status: 'Unpaid' },
    { id: 'INV-2024-005', customerName: 'Apex Construction', amount: 15750.00, dueDate: '2024-10-25', status: 'Unpaid' },
    { id: 'INV-2024-006', customerName: 'Nebula Creative', amount: 2500.00, dueDate: '2024-10-28', status: 'Unpaid' },
  ],
  transactions: [
    // Hard Match: Exact amount + ID in description
    { id: 'TXN-1001', date: '2024-10-16', description: 'TECHSTART SOLUTIONS INV-2024-001', amount: 12500.00, referenceNumber: 'REF-001', isReconciled: false },
    // Fuzzy Match (Vibe): Name variance
    { id: 'TXN-1002', date: '2024-10-19', description: 'TRF FROM GREENLEAF LOG', amount: 4200.50, referenceNumber: 'WIRE-202', isReconciled: false },
    // Variance Match: Amount slightly off (bank fees)
    { id: 'TXN-1003', date: '2024-10-21', description: 'QUANTUM SYS PAYMENT', amount: 8885.00, referenceNumber: 'ACH-993', isReconciled: false },
    // Unreconciled / No Match
    { id: 'TXN-1004', date: '2024-10-22', description: 'Unknown Deposit', amount: 500.00, referenceNumber: 'UNK-111', isReconciled: false },
    // Anomaly: Duplicates
    { id: 'TXN-1005', date: '2024-10-23', description: 'Duplicate Service Charge', amount: 150.00, referenceNumber: 'FEE-001', isReconciled: false },
    { id: 'TXN-1006', date: '2024-10-23', description: 'Duplicate Service Charge', amount: 150.00, referenceNumber: 'FEE-002', isReconciled: false },
  ]
};

export const generateDemoData = async (): Promise<{ invoices: Invoice[], transactions: Transaction[] }> => {
   if (!GEMINI_API_KEY) {
     console.log("No API Key: Using Fallback Demo Data");
     // Use type assertion to ensure compatibility
     return FALLBACK_DEMO_DATA as unknown as { invoices: Invoice[], transactions: Transaction[] };
   }

   const prompt = `
    Generate a realistic B2B dataset for a financial reconciliation demo.
    Create 8 invoices and 8 bank transactions.
    
    Requirements:
    - **Fuzzy Matches (Crucial)**: Generate 3 pairs where the Customer Name on the invoice is SLIGHTLY different from the Transaction Description.
      - Example 1: Invoice "Alpha Solutions Ltd" vs Transaction "TRF FROM ALPHA SOLS".
      - Example 2: Invoice "Omega Healthcare Inc" vs Transaction "OMEGA HEALTH WIRE".
    - **Hard Matches**: Generate 3 pairs that match exactly on Amount and have the Invoice ID in the transaction reference.
    - **Variance Match**: Generate 1 pair where the transaction amount is slightly less (e.g., $15 bank fee deducted) than the invoice amount.
    - **Unpaid/Unreconciled**: Leave 1 invoice unpaid and 1 transaction unreconciled (unrelated).
    - **Anomaly**: Create 2 transactions on the same date with the same amount and description (e.g., "Double Charge") to test anomaly detection.
    
    Return JSON with two arrays: "invoices" and "transactions".
   `;

   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  customerName: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  dueDate: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["Unpaid", "Paid"] },
                }
              }
            },
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                   id: { type: Type.STRING },
                   date: { type: Type.STRING },
                   description: { type: Type.STRING },
                   amount: { type: Type.NUMBER },
                   referenceNumber: { type: Type.STRING },
                   isReconciled: { type: Type.BOOLEAN },
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Safety check: if generation returns empty or malformed data, use fallback
    if (!data.invoices || data.invoices.length === 0) {
        return FALLBACK_DEMO_DATA as unknown as { invoices: Invoice[], transactions: Transaction[] };
    }

    return {
      invoices: data.invoices || [],
      transactions: data.transactions || []
    };

   } catch (e) {
     console.error("Failed to generate demo data, using fallback", e);
     return FALLBACK_DEMO_DATA as unknown as { invoices: Invoice[], transactions: Transaction[] };
   }
};

export const generateSmartToDoList = async (invoices: Invoice[], transactions: Transaction[]): Promise<ToDoItem[]> => {
  if (!GEMINI_API_KEY) {
    return [
      { id: '1', task: 'Upload Invoices', priority: 'High', type: 'Collection' },
      { id: '2', task: 'Upload Bank Statements', priority: 'High', type: 'Reconciliation' },
      { id: '3', task: 'Check for Duplicate Transactions', priority: 'Medium', type: 'Review' }
    ];
  }

  // Summarize data for the prompt to save tokens
  const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;
  const unreconciledCount = transactions.filter(t => !t.isReconciled).length;
  
  // Find potential anomalies (duplicates)
  const anomalies = [];
  const txnMap = new Map();
  transactions.filter(t => !t.isReconciled).forEach(t => {
      const key = `${t.date}-${t.amount}`;
      if (txnMap.has(key)) anomalies.push(t.description);
      txnMap.set(key, true);
  });

  const prompt = `
    You are an intelligent financial assistant. Analyze the current state of the ledger and create a prioritized "To Do" list for the user.

    Current State:
    - Unpaid Invoices: ${unpaidCount}
    - Unreconciled Transactions: ${unreconciledCount}
    - Potential Anomalies (Duplicate amounts on same day): ${anomalies.length > 0 ? anomalies.join(', ') : 'None'}
    
    Instructions:
    - Create 3-5 concise, actionable tasks.
    - If there are anomalies, prioritize investigating them.
    - If there are many unpaid invoices, suggest following up (Collection).
    - If there are many unreconciled transactions, suggest reconciling (Reconciliation).
    
    Return a JSON array of objects with:
    - id (string)
    - task (short string)
    - priority (High, Medium, Low)
    - type (Reconciliation, Collection, Review)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              task: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              type: { type: Type.STRING, enum: ["Reconciliation", "Collection", "Review"] },
            },
            required: ["id", "task", "priority", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to generate to-do list", error);
    return [];
  }
};

export const generateMarketingVideo = async (): Promise<string | null> => {
  if (!GEMINI_API_KEY) {
    console.error("No API key found for video generation");
    return null;
  }

  try {
    // Check if the user has a selected API key using the aistudio global
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) {
          console.warn("User cancelled API key selection");
          return null;
        }
      }
    }

    // Initialize a fresh client for the video request
    const videoAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    console.log("Starting video generation...");
    let operation = await videoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic close-up of a digital financial ledger interface, data streams merging, glowing purple and blue nodes connecting, successful green checkmarks appearing, futuristic corporate aesthetic, 4k, highly detailed, motion graphics.',
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      console.log("Polling video operation...");
      operation = await videoAi.operations.getVideosOperation({operation: operation});
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (uri) {
        // Append API key as required by the docs for fetching the bytes
        return `${uri}&key=${GEMINI_API_KEY}`;
    }
    return null;

  } catch (error) {
    console.error("Failed to generate marketing video:", error);
    return null;
  }
};

export const getChatResponse = async (
  history: ChatMessage[], 
  userMessage: string,
  context: { invoices: Invoice[], transactions: Transaction[], view: string }
): Promise<{ text: string; toolCall?: { name: string; args: any } }> => {
  
  const unpaidCount = context.invoices.filter(i => i.status === 'Unpaid').length;
  const unreconciledCount = context.transactions.filter(t => !t.isReconciled).length;

  const systemInstruction = `
    You are "Ledger Larry", the intelligent assistant for the LedgerLoop application.
    
    App Context:
    - Current View: ${context.view}
    - Unpaid Invoices: ${unpaidCount}
    - Unreconciled Transactions: ${unreconciledCount}
    
    Capabilities (Tools):
    You have access to the following tools to control the application. 
    PROACTIVELY use them if the user asks to go somewhere or do something.
    
    1. navigate_to(view_name)
       - Valid values for view_name: 'dashboard', 'upload', 'reconciliation', 'settings'
       - Use this when user says "go to upload", "I want to reconcile", etc.
    
    2. inspect_anomaly()
       - Use this if user asks to see problems or anomalies. It navigates to dashboard.
    
    Tone: Helpful, professional, slightly witty (junior accountant persona).
    If you don't need a tool, just reply with text.
  `;

  const navigateTool: FunctionDeclaration = {
    name: "navigate_to",
    description: "Navigates the application to a specific page.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        view_name: {
          type: Type.STRING,
          enum: ["dashboard", "upload", "reconciliation", "settings"],
          description: "The page to navigate to."
        }
      },
      required: ["view_name"]
    }
  };

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [navigateTool] }]
      }
    });

    // Send message
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    // Check for function calls (Tools)
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      return {
        text: "Sure, I'm taking care of that for you.", // Fallback text if model doesn't generate conversational text with the call
        toolCall: {
          name: call.name,
          args: call.args
        }
      };
    }

    return { text: response.text || "I'm not sure how to help with that." };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Sorry, I'm having trouble connecting to the ledger mainframe right now." };
  }
};