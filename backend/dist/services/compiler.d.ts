export interface CompilationResult {
    abi: any[];
    bytecode: string;
    contractName: string;
}
/**
 * Compiles Solidity code using solc.
 * Returns the ABI and Bytecode of the first contract found.
 * If compilation fails, throws an Error with the solc error messages.
 */
export declare function compileContract(sourceCode: string): CompilationResult;
//# sourceMappingURL=compiler.d.ts.map