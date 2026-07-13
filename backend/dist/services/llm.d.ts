/**
 * Generates Solidity code from a natural language prompt.
 */
export declare function generateContract(prompt: string, errorFeedback?: string): Promise<string>;
/**
 * Audits a Solidity contract and returns structured JSON.
 */
export declare function auditContract(solidityCode: string): Promise<any>;
/**
 * Hybrid Guardrail: Checks a prompt for injection attacks using Regex + LLM.
 */
export declare function checkPromptInjection(userPrompt: string): Promise<any>;
//# sourceMappingURL=llm.d.ts.map