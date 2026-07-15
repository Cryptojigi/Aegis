import { describe, it, expect } from 'vitest';
import { generateDeploymentPayload } from './deployer';

describe('generateDeploymentPayload', () => {
    it('should return bytecode with 0x prefix when no constructor args', () => {
        const abi: any[] = [];
        const bytecode = '6080604052';
        const result = generateDeploymentPayload(abi, bytecode);
        expect(result).toBe('0x6080604052');
    });

    it('should append encoded constructor args', () => {
        const abi: any[] = [
            {
                type: 'constructor',
                inputs: [
                    { name: '_value', type: 'uint256' }
                ]
            }
        ];
        // Minimal dummy bytecode
        const bytecode = '6080604052';
        const result = generateDeploymentPayload(abi, bytecode, [42]);
        // Should have 0x prefix + bytecode + 32-byte encoded uint(42)
        expect(result).toHaveLength('0x6080604052'.length + 64);
        expect(result.startsWith('0x6080604052')).toBe(true);
    });

    it('should throw on arg mismatch', () => {
        const abi: any[] = [
            {
                type: 'constructor',
                inputs: [
                    { name: '_value', type: 'uint256' }
                ]
            }
        ];
        expect(() => generateDeploymentPayload(abi, '0x1234', [])).toThrow('argument count');
    });

    it('should throw on empty bytecode', () => {
        expect(() => generateDeploymentPayload([], '0x')).toThrow('empty');
    });

    it('should throw on invalid ABI', () => {
        expect(() => generateDeploymentPayload(null as any, '0x1234')).toThrow('Invalid');
    });

    it('should reject oversize bytecode', () => {
        const fatBytecode = '0x' + 'ff'.repeat(50_000);
        expect(() => generateDeploymentPayload([], fatBytecode)).toThrow('too long');
    });
});
