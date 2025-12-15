# Architecture Overview

LedgerLoop is built as a client-side Single Page Application (SPA) that leverages Google's Gemini API for intelligence features. This document outlines the core architectural decisions.

## 1. State Management

LedgerLoop utilizes a **Lifted State** pattern. The core financial data (`invoices`, `transactions`, `auditLog`) resides in the top-level `App.tsx` component and is passed down via props to child views.

*   **Source of Truth:** `App.tsx`
*   **Data Flow:** Unidirectional (Parent -> Child).
*   **Persistence:** Currently in-memory (resets on refresh).

## 2. AI Integration Layer (`services/geminiService.ts`)

We treat AI operations as asynchronous service calls, similar to a backend API.

### Pattern: Structured Generation
We strictly enforce JSON schemas for AI outputs to ensure type safety in the frontend.
*   **Invoice Parsing:** Returns `ScannedInvoice` object.
*   **Reconciliation:** Returns `MatchSuggestion[]` array.

### Pattern: Function Calling (Tool Use)
The Chat Assistant uses the `tools` configuration in Gemini.
1.  User input is sent to `gemini-2.5-flash`.
2.  System instructions define available tools (e.g., `navigate_to`).
3.  The model returns a `functionCall` object instead of text.
4.  The frontend executes the logic (changing the view state) and simulates a response.

## 3. Reconciliation Logic

Reconciliation happens in two passes:

1.  **Deterministic Pass (Hard Match):**
    *   Executed locally in JavaScript.
    *   Matches exact amounts AND (Invoice ID in description OR Reference Number match).
    *   Confidence: 100%.

2.  **Probabilistic Pass (Vibe Match):**
    *   Executed via Gemini AI.
    *   Prompt includes unmatched invoices and transactions.
    *   Instruction: Find fuzzy name matches and allow specific variance thresholds.
    *   Confidence: 65-99%.

## 4. ERP Integration (`services/erpService.ts`)

The ERP service uses the **Adapter Pattern**.
*   `fetchERPInvoices` acts as a unified interface.
*   Mock implementations simulate network latency and specific data structures for Odoo, SAP, NetSuite, and Xero.

## 5. Video Generation

Video generation utilizes the **Veo 3.1** model via the `generateVideos` API.
*   Due to long generation times, the service implements a **Polling Mechanism**.
*   It checks the operation status every 5 seconds until `operation.done` is true.
