# Contributing to LedgerLoop

Thank you for your interest in improving LedgerLoop! We welcome contributions from the community.

## Development Workflow

1.  **Fork the repository** to your own GitHub account.
2.  **Create a branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/amazing-new-feature
    ```
3.  **Make your changes**. Ensure you follow the project's coding style (React functional components, TypeScript interfaces).
4.  **Test your changes**. Ensure the app runs without errors (`npm start`).
5.  **Commit your changes** with descriptive commit messages.
6.  **Push to your branch**:
    ```bash
    git push origin feature/amazing-new-feature
    ```
7.  **Open a Pull Request** against the `main` branch.

## Code Standards

*   **TypeScript:** Strictly type all interfaces in `types.ts`. Avoid `any` whenever possible.
*   **Components:** Keep components small and focused. Use the `components/` directory.
*   **AI Services:** All Gemini API calls should be encapsulated in `services/geminiService.ts`.
*   **Styling:** Use Tailwind CSS utility classes.

## Reporting Issues

If you find a bug, please open an issue on GitHub including:
*   Steps to reproduce.
*   Expected behavior.
*   Screenshots (if applicable).
