# LedgerLoop 🟣

> **The AI-Powered B2B Financial Reconciliation Dashboard**

LedgerLoop is a next-generation financial dashboard designed to automate the tedious process of reconciling invoices with bank transactions. Powered by **Google Gemini 2.5**, it moves beyond simple rule-based matching to understand the "vibe" of transactions, detecting fuzzy matches, handling unstructured data, and identifying anomalies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-v19-blue)
![TypeScript](https://img.shields.io/badge/typescript-v5-blue)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-purple)

## 🌟 Key Features

### 🧠 AI Vibe Match™
Traditional ERPs fail when transaction descriptions don't perfectly match invoice numbers. LedgerLoop uses **Gemini 2.5 Flash** to perform fuzzy matching logic (e.g., matching "TRF FROM INDO JAYA" to "PT Indo Jaya Tbk"), intelligently handling small variances like bank fees.

### 📄 Intelligent Document Processing
Upload PDF invoices and let "Ledger Larry" (our AI agent) extract structured data (Invoice ID, Amount, Customer, Date) automatically, even from messy or blurry documents.

### 💬 Conversational Copilot
Interact with your ledger using natural language. The **Chat Assistant** utilizes **Function Calling** to navigate the app, query data, and perform actions for you.
*   *"Take me to the upload page"*
*   *"Do I have any anomalies?"*

### 📹 Generative Video Demos
Generate high-fidelity marketing demos on the fly using **Gemini Veo 3.1**, creating cinematic visualizations of your financial data streams.

### 🔌 ERP Integration Hub
Simulate connections to major ERP providers (SAP, Odoo, NetSuite, Xero) to sync open invoices directly into your reconciliation workspace.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A **Google Cloud Project** with the Gemini API enabled.
*   An API Key from [Google AI Studio](https://aistudiocdn.com/).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ledgerloop.git
    cd ledgerloop
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    # Your Google Gemini API Key
    API_KEY=your_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm start
    ```

## 🛠️ Tech Stack

*   **Frontend Framework:** React 18+ (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI Model:** Google Gemini 2.5 Flash & Pro, Veo 3.1
*   **AI SDK:** `@google/genai`
*   **Visualization:** Recharts
*   **Icons:** Lucide React

## 📂 Project Structure

```
src/
├── components/       # UI Components (Dashboard, Reconciliation, etc.)
├── services/         # API & AI Logic (geminiService.ts, erpService.ts)
├── types.ts          # TypeScript Definitions
├── App.tsx           # Main Router & State Container
└── index.tsx         # Entry Point
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
