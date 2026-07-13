import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

import { generateContract, auditContract, checkPromptInjection } from './services/llm';
import { compileContract } from './services/compiler';
import { generateDeploymentPayload } from './services/deployer';

// --- A2A Builder Suite (Complex Workflows) ---
app.post('/api/a2a/build-and-deploy', async (req, res) => {
    try {
        const { prompt, constructorArgs = [] } = req.body;
        if (!prompt) return res.status(400).json({ error: "Missing prompt" });

        console.log("1. Generating Solidity...");
        let solidityCode = await generateContract(prompt);
        let compiled;
        let compilationSuccess = false;
        
        // Self-Healing Compiler Loop (Max 2 retries)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`2. Compiling (Attempt ${attempt})...`);
                compiled = compileContract(solidityCode);
                compilationSuccess = true;
                break; // Success!
            } catch (error: any) {
                console.warn(`Compilation failed on attempt ${attempt}:`, error.message);
                if (attempt === 3) throw new Error("Failed to compile after 3 attempts.");
                // Ask LLM to fix it
                console.log("Self-healing: Asking LLM to fix compiler errors...");
                solidityCode = await generateContract(prompt, error.message);
            }
        }

        if (!compilationSuccess || !compiled) {
            throw new Error("Compilation pipeline failed critically.");
        }

        console.log("3. Generating Deployment Payload...");
        const payload = generateDeploymentPayload(compiled.abi, compiled.bytecode, constructorArgs);

        console.log("4. Running Security Audit...");
        const auditReport = await auditContract(solidityCode);

        res.json({
            status: "success",
            contractName: compiled.contractName,
            sourceCode: solidityCode,
            abi: compiled.abi,
            deploymentPayload: payload,
            securityAudit: auditReport
        });
    } catch (error: any) {
        console.error("Build & Deploy Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- A2MCP Security Suite (Paid Tier via x402) ---
// const requirePayment = x402Middleware({ receiver: process.env.RECEIVER_WALLET_PRIVATE_KEY, callbackUrl: process.env.CALLBACK_BASE_URL });
app.post('/api/paid/audit-contract', /* requirePayment, */ async (req, res) => {
    try {
        const { sourceCode } = req.body;
        if (!sourceCode) return res.status(400).json({ error: "Missing sourceCode" });
        
        const report = await auditContract(sourceCode);
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/paid/guardrail', /* requirePayment, */ async (req, res) => {
    try {
        const { userPrompt } = req.body;
        if (!userPrompt) return res.status(400).json({ error: "Missing userPrompt" });

        const check = await checkPromptInjection(userPrompt);
        res.json(check);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- A2MCP Utility (Free Tier) ---
app.post('/api/free/abi-decode', async (req, res) => {
    // Basic stub for decoding hex data using ethers (usually needs the ABI to fully decode, 
    // but can decode method signatures or standard ERC20 transfers).
    res.json({ message: "ABI decode endpoint active." });
});

app.post('/api/free/verify-deployment', async (req, res) => {
    const { contractAddress, sourceCode } = req.body;
    // Here we would call the OKLink/X Layer Scan API to verify the contract
    res.json({ status: "Pending verification on X Layer explorer", contractAddress });
});

app.listen(PORT, () => {
    console.log(`🛡️ Aegis backend running on port ${PORT}`);
});
