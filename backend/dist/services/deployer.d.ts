/**
 * Generates an unsigned transaction payload for deploying a smart contract.
 * @param abi The contract ABI
 * @param bytecode The contract creation bytecode (hex string)
 * @param constructorArgs Array of values matching the constructor parameters
 * @returns The hex string payload to be sent as the `data` field in an eth_sendTransaction call
 */
export declare function generateDeploymentPayload(abi: any[], bytecode: string, constructorArgs?: any[]): string;
//# sourceMappingURL=deployer.d.ts.map