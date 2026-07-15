import { describe, it, expect } from 'vitest';
import { extractJson } from '../utils/json';

describe('extractJson', () => {
    it('should parse clean JSON', () => {
        const result = extractJson('{"a": 1, "b": "hello"}');
        expect(result).toEqual({ a: 1, b: 'hello' });
    });

    it('should strip markdown fences', () => {
        const result = extractJson('```json\n{"a": 1}\n```');
        expect(result).toEqual({ a: 1 });
    });

    it('should strip markdown without language tag', () => {
        const result = extractJson('```\n{"a": 1}\n```');
        expect(result).toEqual({ a: 1 });
    });

    it('should find JSON block in surrounding text', () => {
        const result = extractJson('Here is the result:\n{"a": 1}\nEnd.');
        expect(result).toEqual({ a: 1 });
    });

    it('should parse arrays', () => {
        const result = extractJson('[1, 2, 3]');
        expect(result).toEqual([1, 2, 3]);
    });

    it('should throw on non-JSON text', () => {
        expect(() => extractJson('just some random text')).toThrow('Could not extract');
    });

    it('should throw on empty string', () => {
        expect(() => extractJson('')).toThrow('Empty response');
    });

    it('should handle nested JSON with escaped quotes', () => {
        const text = '{"vulnerabilities": [{"title": "Reentrancy", "severity": "High"}]}';
        const result = extractJson(text);
        expect(result.vulnerabilities[0].title).toBe('Reentrancy');
    });
});
