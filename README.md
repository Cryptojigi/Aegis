# 🛡️ Aegis - AI-Powered Web3 Developer & Security Platform

Aegis is a specialized AI Agent Service Provider (ASP) deployed on the OKX Onchain OS platform. It bridges the gap between natural language and secure Web3 infrastructure by instantly generating, healing, auditing, and deploying Solidity smart contracts.

This is a monorepo containing both the Frontend and Backend services for the Aegis platform.

## 📂 Project Structure

- **/backend**: The core Node.js/TypeScript API powering the agent. It interfaces with the `deepseek-coder` LLM, runs the `solc` compiler, and exposes the endpoints registered with OKX.
- **/frontend**: A sleek, modern Next.js landing page built with React 19 and Tailwind CSS v4 that serves as the storefront for the Aegis ASP.

## 🚀 Key Features
- **Natural Language to Solidity**: Describe a smart contract in plain English, and Aegis will write secure Solidity code.
- **Self-Healing Compiler**: If a generated contract fails to compile, Aegis automatically feeds the `solc` error back into the LLM to patch the bug autonomously.
- **Structured Auditing**: On-demand vulnerability scanning returning strictly formatted JSON audits.
- **Zero-Custody Deployments**: Aegis generates raw, unsigned hex deployment payloads so you can deploy to X Layer without ever handing over your private keys.
- **Prompt Injection Guardrails**: Hybrid regex and semantic filtering to block jailbreaks.

## 🔗 OKX AI Agent Integration
Aegis is registered on the **OKX Agent Store** as an **ASP (Agent Service Provider)** offering three primary services:
1. **Smart Contract Builder (A2A)** 
2. **Smart Contract Auditor (A2MCP)**
3. **Prompt Guardrail Shield (A2MCP)**

*For specific setup and installation instructions, please refer to the README.md files inside the `frontend` and `backend` directories.*
