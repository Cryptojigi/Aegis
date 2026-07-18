import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Parse JSON with size limits to prevent abuse
app.use(express.json({ limit: '500kb' }));

// Global rate limiting: 100 requests per 15 min per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — try again later" }
});
app.use(globalLimiter);

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { generateContract, auditContract, checkPromptInjection } from './services/llm';
import { compileContract } from './services/compiler';
import { generateDeploymentPayload } from './services/deployer';
import { requirePayment } from './middleware/x402';

// ---------------------------------------------------------------------------
// Helper: Standard API response wrapper
// ---------------------------------------------------------------------------

interface ApiSuccess<T = any> {
    status: "success";
    data: T;
}

interface ApiError {
    status: "error";
    error: string;
    code?: string;
}

function success<T>(data: T): ApiSuccess<T> {
    return { status: "success", data };
}

function fail(error: string, code?: string): ApiError {
    return { status: "error", error, code };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateString(val: any, name: string, maxLen = 500_000): string {
    if (typeof val !== 'string' || val.trim().length === 0) {
        throw new ValidationError(`${name} is required and must be a non-empty string`);
    }
    if (val.length > maxLen) {
        throw new ValidationError(`${name} exceeds maximum length of ${maxLen} characters`);
    }
    return val.trim();
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ---------------------------------------------------------------------------
// Route: A2A Builder Suite (Complex Workflows)
// ---------------------------------------------------------------------------

app.post('/api/a2a/build-and-deploy', async (req, res) => {
    try {
        const prompt = validateString(req.body.prompt, 'prompt', 10_000);
        const constructorArgs = Array.isArray(req.body.constructorArgs) ? req.body.constructorArgs : [];

        // Phase 1: Generate Solidity
        let solidityCode = await generateContract(prompt);
        let compiled;
        let compilationSuccess = false;

        // Self-Healing Compiler Loop (max 3 attempts, 2 retries)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                compiled = compileContract(solidityCode);
                compilationSuccess = true;
                break;
            } catch (error: any) {
                console.warn(`Compilation failed (attempt ${attempt}/3):`, error.message);
                if (attempt === 3) {
                    throw new Error(`Failed to compile after 3 attempts: ${error.message}`);
                }
                solidityCode = await generateContract(prompt, error.message);
            }
        }

        if (!compilationSuccess || !compiled) {
            throw new Error("Compilation pipeline failed critically.");
        }

        // Phase 2: Generate deployment payload
        const deploymentPayload = generateDeploymentPayload(compiled.abi, compiled.bytecode, constructorArgs);

        // Phase 3: Security audit
        const securityAudit = await auditContract(solidityCode);

        return res.json(success({
            contractName: compiled.contractName,
            sourceCode: solidityCode,
            abi: compiled.abi,
            bytecode: compiled.bytecode,
            deploymentPayload,
            securityAudit
        }));
    } catch (error: any) {
        console.error("Build & Deploy Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        return res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});

// ---------------------------------------------------------------------------
// Route: A2MCP Security Suite (Paid Tier)
// ---------------------------------------------------------------------------

app.all('/api/paid/audit-contract', requirePayment({ amount: 1.5 }), async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json(fail("Method Not Allowed. Please use POST with required body.", "METHOD_NOT_ALLOWED"));
        }

        const sourceCode = validateString(req.body.sourceCode, 'sourceCode', 100_000);

        const report = await auditContract(sourceCode);
        return res.json(success(report));
    } catch (error: any) {
        console.error("Audit Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        return res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});

app.all('/api/paid/guardrail', requirePayment({ amount: 0.5 }), async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json(fail("Method Not Allowed. Please use POST with required body.", "METHOD_NOT_ALLOWED"));
        }

        const userPrompt = validateString(req.body.userPrompt, 'userPrompt', 10_000);

        const check = await checkPromptInjection(userPrompt);
        return res.json(success(check));
    } catch (error: any) {
        console.error("Guardrail Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        return res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});

// ---------------------------------------------------------------------------
// Route: Free Utility Tier
// ---------------------------------------------------------------------------

/**
 * ABI-encodes function call data.
 * GET /api/free/abi-encode?function=transfer(address,uint256)&args=0x...,100
 */
app.post('/api/free/abi-encode', async (req, res): Promise<any> => {
    try {
        const { types, values } = req.body;

        if (!Array.isArray(types) || !Array.isArray(values)) {
            return res.status(400).json(fail(
                "'types' (string[]) and 'values' (any[]) are required",
                'VALIDATION_ERROR'
            ));
        }
        if (types.length !== values.length) {
            return res.status(400).json(fail(
                `'types' (${types.length}) and 'values' (${values.length}) length mismatch`,
                'VALIDATION_ERROR'
            ));
        }

        const abiCoder = new (await import('ethers')).AbiCoder();
        const encoded = abiCoder.encode(types, values);

        return res.json(success({ encoded, types, values }));
    } catch (error: any) {
        console.error("ABI Encode Error:", error);
        return res.status(400).json(fail(error.message, 'ENCODE_ERROR'));
    }
});

/**
 * Decodes ABI-encoded data.
 * POST /api/free/abi-decode
 * Body: { types: string[], data: "0x..." }
 */
app.post('/api/free/abi-decode', async (req, res): Promise<any> => {
    try {
        const types = req.body.types;
        const data = req.body.data;

        if (!Array.isArray(types) || types.length === 0) {
            return res.status(400).json(fail("'types' (string[]) is required", 'VALIDATION_ERROR'));
        }
        if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
            return res.status(400).json(fail("'data' (0x-prefixed hex string) is required", 'VALIDATION_ERROR'));
        }

        const abiCoder = new (await import('ethers')).AbiCoder();
        const decoded = abiCoder.decode(types, data);

        return res.json(success({
            types,
            data,
            decoded: decoded.map((v: any) => v.toString())
        }));
    } catch (error: any) {
        console.error("ABI Decode Error:", error);
        return res.status(400).json(fail(error.message, 'DECODE_ERROR'));
    }
});

/**
 * Simple address checksum tool.
 * POST /api/free/checksum-address
 * Body: { address: "0x..." }
 */
app.post('/api/free/checksum-address', async (req, res): Promise<any> => {
    try {
        const address = validateString(req.body.address, 'address', 100);

        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json(fail("Invalid EVM address format", 'VALIDATION_ERROR'));
        }

        const checksummed = (await import('ethers')).getAddress(address);

        return res.json(success({
            original: address,
            checksummed,
            valid: checksummed.toLowerCase() === address.toLowerCase()
        }));
    } catch (error: any) {
        console.error("Checksum Error:", error);
        return res.status(400).json(fail(error.message, 'CHECKSUM_ERROR'));
    }
});

/**
 * Health check.
 */
app.get('/api/health', async (_req, res) => {
    return res.json(success({
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    }));
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    return res.status(500).json(fail("An unexpected error occurred", 'INTERNAL_ERROR'));
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`🛡️ Aegis backend running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Builder: POST /api/a2a/build-and-deploy`);
    console.log(`   Audit: POST /api/paid/audit-contract`);
    console.log(`   Guardrail: POST /api/paid/guardrail`);
});
