"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeploymentPayload = generateDeploymentPayload;
const ethers_1 = require("ethers");
const MAX_BYTECODE_LENGTH = 48_000; // ~24KB hex — generous for most contracts
/**
 * Generates an unsigned transaction payload for deploying a smart contract.
 * @param abi The contract ABI
 * @param bytecode The contract creation bytecode (hex string)
 * @param constructorArgs Array of values matching the constructor parameters
 * @returns The hex string payload to be sent as the `data` field in an eth_sendTransaction call
 */
function generateDeploymentPayload(abi, bytecode, constructorArgs = []) {
    // 1. Validate inputs
    if (!abi || !Array.isArray(abi)) {
        throw new Error("Invalid or missing ABI");
    }
    if (!bytecode || typeof bytecode !== 'string') {
        throw new Error("Invalid or missing bytecode");
    }
    if (!Array.isArray(constructorArgs)) {
        throw new Error("constructorArgs must be an array");
    }
    // 2. Normalize bytecode
    let data = bytecode.startsWith('0x') ? bytecode : '0x' + bytecode;
    if (data.length > MAX_BYTECODE_LENGTH) {
        throw new Error(`Bytecode too long (${data.length} hex chars, max ${MAX_BYTECODE_LENGTH})`);
    }
    // 3. Empty bytecheck
    if (data === '0x' || data === '0x00') {
        throw new Error("Bytecode is empty — contract may be abstract or an interface");
    }
    // 4. Find the constructor in the ABI
    const constructorAbi = abi.find((entry) => entry.type === 'constructor');
    // 5. Validate constructor args
    if (!constructorAbi && constructorArgs.length > 0) {
        throw new Error("Constructor arguments provided, but no constructor found in ABI.");
    }
    // 6. ABI-encode constructor arguments if needed
    if (constructorAbi) {
        const types = constructorAbi.inputs.map((input) => input.type);
        if (types.length !== constructorArgs.length) {
            throw new Error(`Constructor argument count mismatch: expected ${types.length}, got ${constructorArgs.length}.`);
        }
        const abiCoder = new ethers_1.ethers.AbiCoder();
        const encodedArgs = abiCoder.encode(types, constructorArgs);
        // Remove the '0x' prefix from encoded args before appending
        data += encodedArgs.slice(2);
    }
    return data;
}
//# sourceMappingURL=deployer.js.map