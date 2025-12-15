# LedgerLoop User Guide

## 1. Dashboard
The landing view provides a high-level overview of your financial health.
*   **Cash Position:** Total of all reconciled transaction amounts.
*   **Outstanding Receivables:** Total of all Unpaid invoices.
*   **AI To-Do List:** Click "Generate Daily Plan" to let AI prioritize your tasks.
*   **Anomaly List:** Shows duplicate transactions or suspicious entries.

## 2. Uploading Data
Navigate to the "Upload Data" tab.
*   **Invoices:** Drag & drop PDF files. The AI will extract the data. Review and approve the extracted data in the table below.
*   **Bank Statements:** Drag & drop CSV files (simulated).
*   **ERP Sync:** Click "Sync from SAP" or use the Integration Grid to pull open invoices from external systems.

## 3. Reconciliation
Navigate to the "Reconciliation" tab.
*   **Manual Match:** Click an Invoice on the left, then a Transaction on the right. Click "Match Selected".
*   **AI Auto-Match:** Click the "Reconcile Now" button.
    *   The AI will analyze the data and present "Suggested Matches".
    *   Review the **Reasoning** and **Confidence**.
    *   Click "Confirm" to apply the match to the ledger.
*   **Audit Log:** View a history of all matches at the bottom of the screen.

## 4. Chat Assistant
Click the floating chat icon in the bottom right.
*   **Navigation:** Ask "Go to settings" or "Back to dashboard".
*   **Context:** The assistant knows how many unpaid invoices you have.
*   **Help:** Ask "How do I reconcile?" for guidance.

## 5. Demo Data
If you don't have files handy, go to the **Upload** page and click **"Populate Demo Data"**. This will generate a realistic scenario with messy data perfect for testing the AI matching capabilities.
