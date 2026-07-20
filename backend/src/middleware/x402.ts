/**
 * x402 Payment Middleware — OKX Native
 *
 * Implements the OKX x402 payment protocol for Aegis's paid endpoints.
 * Returns HTTP 402 with the standard accepts[] challenge format,
 * and accepts X-PAYMENT authorization headers on replay.
 */

import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentConfig {
    amount: number;
    asset?: string;
}

interface PaymentChallenge {
    accepts: Array<{
        scheme: string;
        network: string;
        asset: string;
        amount: string;
        payTo: string;
        decimals?: number;
    }>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Keep original case for challenge output (checksum-safe),
// use RECEIVING_WALLET_LC only for internal comparisons.
const RECEIVING_WALLET = process.env.RECEIVING_WALLET_ADDRESS || '';
const RECEIVING_WALLET_LC = RECEIVING_WALLET.toLowerCase();
const ADMIN_BYPASS_KEY = process.env.ADMIN_BYPASS_KEY || '';
const USDT_XLAYER = process.env.USDT_CONTRACT_ADDRESS || '0x779ded0c9e1022225f8e0630b35a9b54be713736';
const CHAIN_ID = process.env.CHAIN_ID || '196';
const USDT_DECIMALS = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBaseUnits(amount: number): string {
    const base = BigInt(Math.round(amount * 10 ** USDT_DECIMALS));
    return base.toString();
}

// ---------------------------------------------------------------------------
// EIP-712 / EIP-3009 Setup
// ---------------------------------------------------------------------------

const eip712Domain = {
    name: 'Tether USD',
    version: '1',
    chainId: Number(CHAIN_ID),
    verifyingContract: USDT_XLAYER
};

const eip712Types = {
    TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
    ]
};

function buildChallenge(amount: number): PaymentChallenge {
    return {
        accepts: [
            {
                scheme: 'x402',
                network: `eip155:${CHAIN_ID}`,
                asset: USDT_XLAYER,
                amount: toBaseUnits(amount),
                payTo: RECEIVING_WALLET,
                decimals: USDT_DECIMALS,
            },
        ],
    };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function requirePayment(config: PaymentConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // -----------------------------------------------------------------
            // 1. Admin Bypass
            // -----------------------------------------------------------------
            if (ADMIN_BYPASS_KEY && req.headers['x-admin-bypass'] === ADMIN_BYPASS_KEY) {
                console.log('[x402] Admin bypass — skipping payment');
                return next();
            }

            // -----------------------------------------------------------------
            // 2. Check for PAYMENT-SIGNATURE or X-PAYMENT header
            // -----------------------------------------------------------------
            const rawHeader = req.headers['payment-signature'] || req.headers['x-payment'];
            const paymentHeader = rawHeader as string | undefined;

            if (paymentHeader && paymentHeader.trim().length > 0) {
                console.log('[x402] Payment header present, validating EIP-3009 signature...');

                try {
                    // Strip prefixes
                    let jsonString = paymentHeader.trim();
                    if (jsonString.toLowerCase().startsWith('x402 ')) {
                        jsonString = jsonString.slice(5).trim();
                    } else if (jsonString.toLowerCase().startsWith('payment:')) {
                        jsonString = jsonString.slice(8).trim();
                    }

                    const payload = JSON.parse(jsonString);

                    // Extract auth fields
                    const auth = payload.authorization || payload;
                    let signature = payload.signature || auth.signature;
                    
                    if (!signature) {
                        if (auth.v && auth.r && auth.s) {
                            signature = { v: auth.v, r: auth.r, s: auth.s };
                        } else if (payload.v && payload.r && payload.s) {
                            signature = { v: payload.v, r: payload.r, s: payload.s };
                        }
                    }

                    if (!auth || !auth.from || !auth.to || !auth.value || !signature) {
                        console.error('[x402] Missing EIP-3009 fields in payload');
                        return res.status(402).json({ error: 'Missing EIP-3009 fields', code: 'PAYMENT_INVALID' });
                    }

                    // Validate recipient
                    if (auth.to.toLowerCase() !== RECEIVING_WALLET_LC) {
                        console.error(`[x402] Invalid recipient: ${auth.to}`);
                        return res.status(402).json({ error: 'Invalid recipient', code: 'PAYMENT_INVALID' });
                    }

                    // Validate amount
                    const requiredBase = BigInt(toBaseUnits(config.amount));
                    if (BigInt(auth.value) < requiredBase) {
                        console.error(`[x402] Insufficient amount: ${auth.value} < ${requiredBase}`);
                        return res.status(402).json({ error: 'Insufficient amount', code: 'PAYMENT_INVALID' });
                    }

                    // Reconstruct message
                    const message = {
                        from: auth.from,
                        to: auth.to,
                        value: auth.value,
                        validAfter: auth.validAfter,
                        validBefore: auth.validBefore,
                        nonce: auth.nonce
                    };

                    let recovered: string;
                    try {
                        recovered = ethers.verifyTypedData(eip712Domain, eip712Types, message, signature);
                    } catch (e) {
                        // Fallback domain name in case bridged USDT uses 'USDT'
                        const fallbackDomain = { ...eip712Domain, name: 'USDT' };
                        recovered = ethers.verifyTypedData(fallbackDomain, eip712Types, message, signature);
                    }

                    if (recovered.toLowerCase() === auth.from.toLowerCase()) {
                        console.log('[x402] EIP-3009 Signature Verified ✅');
                        return next();
                    } else {
                        console.error(`[x402] Signature mismatch! Recovered ${recovered}, expected ${auth.from}`);
                        return res.status(402).json({ error: 'Invalid EIP-3009 signature', code: 'PAYMENT_INVALID' });
                    }

                } catch (error: any) {
                    console.error('[x402] Parsing/Verification Error:', error.message);
                    // Fall through to issue the 402 challenge below
                }
            }

            // -----------------------------------------------------------------
            // 3. No valid payment — issue challenge
            // -----------------------------------------------------------------
            const challenge = buildChallenge(config.amount);
            const challengeJson = JSON.stringify(challenge);
            const base64Challenge = Buffer.from(challengeJson).toString('base64');

            res.setHeader('PAYMENT-REQUIRED', base64Challenge);
            res.setHeader('WWW-Authenticate', `Payment realm="Aegis", intent="charge"`);

            res.status(402).json(challenge);
            return;
        } catch (error: any) {
            console.error('[x402] Middleware error:', error);
            return res.status(500).json({
                status: 'error',
                error: 'Payment verification unavailable',
                code: 'PAYMENT_SYSTEM_ERROR',
            });
        }
    };
}
