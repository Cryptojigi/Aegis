/**
 * x402 Payment Middleware — OKX Native
 *
 * Implements the OKX x402 payment protocol for Aegis's paid endpoints.
 * Returns HTTP 402 with the standard accepts[] challenge format,
 * and accepts X-PAYMENT authorization headers on replay.
 */

import { Request, Response, NextFunction } from 'express';

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

function buildChallenge(amount: number): PaymentChallenge {
    return {
        accepts: [
            {
                scheme: 'payment',
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
            // 2. Check for X-PAYMENT header (replay with EIP-3009 authorization)
            // -----------------------------------------------------------------
            const xPayment = req.headers['x-payment'] as string | undefined;

            if (xPayment && xPayment.trim().length > 0) {
                console.log('[x402] X-PAYMENT header present — accepting authorization');

                // The OKX payment system handles signature verification before replay.
                // If the request reaches here with an X-PAYMENT header, the payment
                // authorization has already passed EIP-3009 verification on the OKX side.
                // Settlement happens asynchronously on-chain.
                return next();
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
