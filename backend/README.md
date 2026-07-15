# Aegis Backend

The core Node.js/TypeScript backend powering the Aegis OKX Agent. It leverages the `deepseek-coder` LLM to generate secure smart contracts, automatically heals compilation errors via `solc`, and generates unsigned transaction payloads for X Layer deployment.

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **LLM Integration**: OpenAI SDK (DeepSeek API)
- **Compilation**: `solc` (Solidity Compiler)

## Endpoints

### 1. `POST /api/a2a/build-and-deploy`
Accepts a natural language prompt, writes the Solidity code, compiles it (self-healing if necessary), audits it, and returns the raw hex transaction payload for deployment.

### 2. `POST /api/paid/audit-contract`
Accepts raw Solidity source code and returns a strictly structured JSON audit report detailing vulnerabilities, severities, and recommendations.

### 3. `POST /api/paid/guardrail`
A security tool that checks user prompts for jailbreaks or prompt injection attacks using a hybrid Regex and Semantic LLM check.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root of the `backend` directory and add the following keys:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_MODEL=deepseek-coder
   PORT=3001
   OKX_API_KEY=your_okx_api_key
   OKX_SECRET_KEY=your_okx_secret_key
   OKX_PASSPHRASE=your_okx_passphrase
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   *(For development, you can use `npm run dev` if configured).*
