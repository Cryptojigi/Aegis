/**
 * Generates Solidity code from a natural language prompt.
 * Optimized for standalone compilation (avoids unresolvable external imports).
 */
export declare function generateContract(prompt: string, errorFeedback?: string): Promise<string>;
/**
 * Audits a Solidity contract and returns a structured vulnerability report.
 */
export declare function auditContract(solidityCode: string): Promise<any>;
/**
 * Hybrid Guardrail: Checks a prompt for injection attacks using Regex + LLM semantics.
 */
export declare function checkPromptInjection(userPrompt: string): Promise<any>;
//# sourceMappingURL=llm.d.ts.map