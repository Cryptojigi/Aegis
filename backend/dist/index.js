"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
// Parse JSON with size limits to prevent abuse
app.use(express_1.default.json({ limit: '500kb' }));
// Global rate limiting: 100 requests per 15 min per IP
const globalLimiter = (0, express_rate_limit_1.default)({
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
const llm_1 = require("./services/llm");
const compiler_1 = require("./services/compiler");
const deployer_1 = require("./services/deployer");
const x402_1 = require("./middleware/x402");
function success(data) {
    return { status: "success", data };
}
function fail(error, code) {
    return { status: "error", error, code };
}
// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function validateString(val, name, maxLen = 500_000) {
    if (typeof val !== 'string' || val.trim().length === 0) {
        throw new ValidationError(`${name} is required and must be a non-empty string`);
    }
    if (val.length > maxLen) {
        throw new ValidationError(`${name} exceeds maximum length of ${maxLen} characters`);
    }
    return val.trim();
}
class ValidationError extends Error {
    constructor(message) {
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
        let solidityCode = await (0, llm_1.generateContract)(prompt);
        let compiled;
        let compilationSuccess = false;
        // Self-Healing Compiler Loop (max 3 attempts, 2 retries)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                compiled = (0, compiler_1.compileContract)(solidityCode);
                compilationSuccess = true;
                break;
            }
            catch (error) {
                console.warn(`Compilation failed (attempt ${attempt}/3):`, error.message);
                if (attempt === 3) {
                    throw new Error(`Failed to compile after 3 attempts: ${error.message}`);
                }
                solidityCode = await (0, llm_1.generateContract)(prompt, error.message);
            }
        }
        if (!compilationSuccess || !compiled) {
            throw new Error("Compilation pipeline failed critically.");
        }
        // Phase 2: Generate deployment payload
        const deploymentPayload = (0, deployer_1.generateDeploymentPayload)(compiled.abi, compiled.bytecode, constructorArgs);
        // Phase 3: Security audit
        const securityAudit = await (0, llm_1.auditContract)(solidityCode);
        res.json(success({
            contractName: compiled.contractName,
            sourceCode: solidityCode,
            abi: compiled.abi,
            bytecode: compiled.bytecode,
            deploymentPayload,
            securityAudit
        }));
    }
    catch (error) {
        console.error("Build & Deploy Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});
// ---------------------------------------------------------------------------
// Route: A2MCP Security Suite (Paid Tier)
// ---------------------------------------------------------------------------
app.all('/api/paid/audit-contract', (0, x402_1.requirePayment)({ amount: 1.5 }), async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json(fail("Method Not Allowed. Please use POST with body: { sourceCode: '...' }", 'METHOD_NOT_ALLOWED'));
        }
        const sourceCode = validateString(req.body.sourceCode, 'sourceCode', 100_000);
        const report = await (0, llm_1.auditContract)(sourceCode);
        res.json(success(report));
    }
    catch (error) {
        console.error("Audit Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});
app.all('/api/paid/guardrail', (0, x402_1.requirePayment)({ amount: 0.5 }), async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json(fail("Method Not Allowed. Please use POST with body: { userPrompt: '...' }", 'METHOD_NOT_ALLOWED'));
        }
        const userPrompt = validateString(req.body.userPrompt, 'userPrompt', 10_000);
        const check = await (0, llm_1.checkPromptInjection)(userPrompt);
        res.json(success(check));
    }
    catch (error) {
        console.error("Guardrail Error:", error);
        const statusCode = error instanceof ValidationError ? 400 : 500;
        res.status(statusCode).json(fail(error.message, error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'));
    }
});
// ---------------------------------------------------------------------------
// Route: Free Utility Tier
// ---------------------------------------------------------------------------
/**
 * ABI-encodes function call data.
 * GET /api/free/abi-encode?function=transfer(address,uint256)&args=0x...,100
 */
app.post('/api/free/abi-encode', async (req, res) => {
    try {
        const { types, values } = req.body;
        if (!Array.isArray(types) || !Array.isArray(values)) {
            return res.status(400).json(fail("'types' (string[]) and 'values' (any[]) are required", 'VALIDATION_ERROR'));
        }
        if (types.length !== values.length) {
            return res.status(400).json(fail(`'types' (${types.length}) and 'values' (${values.length}) length mismatch`, 'VALIDATION_ERROR'));
        }
        const abiCoder = new (await import('ethers')).AbiCoder();
        const encoded = abiCoder.encode(types, values);
        res.json(success({ encoded, types, values }));
    }
    catch (error) {
        console.error("ABI Encode Error:", error);
        res.status(400).json(fail(error.message, 'ENCODE_ERROR'));
    }
});
/**
 * Decodes ABI-encoded data.
 * POST /api/free/abi-decode
 * Body: { types: string[], data: "0x..." }
 */
app.post('/api/free/abi-decode', async (req, res) => {
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
        res.json(success({
            types,
            data,
            decoded: decoded.map((v) => v.toString())
        }));
    }
    catch (error) {
        console.error("ABI Decode Error:", error);
        res.status(400).json(fail(error.message, 'DECODE_ERROR'));
    }
});
/**
 * Simple address checksum tool.
 * POST /api/free/checksum-address
 * Body: { address: "0x..." }
 */
app.post('/api/free/checksum-address', async (req, res) => {
    try {
        const address = validateString(req.body.address, 'address', 100);
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json(fail("Invalid EVM address format", 'VALIDATION_ERROR'));
        }
        const checksummed = (await import('ethers')).getAddress(address);
        res.json(success({
            original: address,
            checksummed,
            valid: checksummed.toLowerCase() === address.toLowerCase()
        }));
    }
    catch (error) {
        console.error("Checksum Error:", error);
        res.status(400).json(fail(error.message, 'CHECKSUM_ERROR'));
    }
});
/**
 * Health check.
 */
app.get('/api/health', async (_req, res) => {
    res.json(success({
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    }));
});
// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json(fail("An unexpected error occurred", 'INTERNAL_ERROR'));
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
//# sourceMappingURL=index.js.map