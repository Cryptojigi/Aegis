import { ethers } from 'ethers';

/**
 * Generates an unsigned transaction payload for deploying a smart contract.
 * @param abi The contract ABI
 * @param bytecode The contract creation bytecode (hex string)
 * @param constructorArgs Array of values matching the constructor parameters
 * @returns The hex string payload to be sent as the `data` field in an eth_sendTransaction call
 */
export function generateDeploymentPayload(abi: any[], bytecode: string, constructorArgs: any[] = []): string {
    // 1. Ensure bytecode starts with '0x'
    let data = bytecode;
    if (!data.startsWith('0x')) {
        data = '0x' + data;
    }

    // 2. Find the constructor in the ABI
    const constructorAbi = abi.find((entry) => entry.type === 'constructor');

    // 3. If no constructor is defined but args are provided, that's an error
    if (!constructorAbi && constructorArgs.length > 0) {
        throw new Error("Constructor arguments provided, but no constructor found in ABI.");
    }

    // 4. If a constructor exists, ABI-encode the arguments and append to the bytecode
    if (constructorAbi) {
        const types = constructorAbi.inputs.map((input: any) => input.type);
        
        if (types.length !== constructorArgs.length) {
            throw new Error(`Expected ${types.length} constructor arguments, but got ${constructorArgs.length}.`);
        }

        const abiCoder = new ethers.AbiCoder();
        const encodedArgs = abiCoder.encode(types, constructorArgs);
        
        // Remove the '0x' from the encoded args before appending
        data += encodedArgs.slice(2);
    }

    return data;
}
