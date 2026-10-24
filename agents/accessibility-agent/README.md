# Accessibility Agent

This project implements an end-to-end Accessibility CI/CD Audit & Remediation Agent along with a local Model Context Protocol (MCP) server.

## Features

- **Accessibility Auditing**: Headless Playwright integration with `@axe-core/playwright` for comprehensive WCAG 2.1 & 2.2 AA scanning.
- **Report Generation**: Parses AxeResults into structured JSON summaries and GitHub PR Markdown tables for easy review.
- **AI Remediation**: Utilizes the Gemini API (`gemini-2.5-pro`) to suggest and apply accessibility fixes.
- **Code Mapping**: Scans the workspace to map DOM selectors and HTML snippets to their corresponding source files.
- **MCP Server**: Provides a local Model Context Protocol server for seamless integration with Cursor and other tools.
- **CI/CD Integration**: GitHub Actions workflow to automate PR checks, generate reports, and trigger AI fixes via comments.

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/gdgcblr/open-source-agents.git
    cd open-source-agents/agents/accessibility-agent
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Copy `.env.example` to `.env` and fill in your Gemini API key.
    ```bash
    cp .env.example .env
    ```
4.  **Build the project**:
    ```bash
    npm run build
    ```
5.  **Run the MCP Server (for local development/testing)**:
    ```bash
    npm run mcp-server
    ```
6.  **Use the CLI**:
    ```bash
    npm start -- audit <url>
    npm start -- fix <file-path> <line-number>
    ```

## Project Structure

```
agents/accessibility-agent/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── .cursor/
│   └── mcp.json
├── src/
│   ├── core/
│   │   ├── audit.ts
│   │   └── reporter.ts
│   ├── agent/
│   │   ├── ai-fixer.ts
│   │   └── mapper.ts
│   ├── mcp/
│   │   └── server.ts
│   ├── ci/
│   │   └── github-action.ts
│   └── index.ts
└── .github/workflows/
    └── a11y-pipeline.yml
```
