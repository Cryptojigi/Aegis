import solc from 'solc';
import path from 'path';

export interface CompilationResult {
    abi: any[];
    bytecode: string;
    contractName: string;
}

const MAX_SOURCE_SIZE = 100_000; // 100KB

/**
 * Compiles Solidity code using solc.
 * Supports @openzeppelin/contracts imports via remappings.
 * Returns the ABI and Bytecode of the first contract found.
 * If compilation fails, throws an Error with the solc error messages.
 */
export function compileContract(sourceCode: string): CompilationResult {
    if (sourceCode.length > MAX_SOURCE_SIZE) {
        throw new Error(`Source code exceeds maximum size of ${MAX_SOURCE_SIZE} characters`);
    }

    // Resolve OpenZeppelin path for remappings
    const ozPath = resolveOpenZeppelinPath();

    const input = {
        language: 'Solidity',
        sources: {
            'Contract.sol': {
                content: sourceCode
            }
        },
        settings: {
            remappings: [
                `@openzeppelin/=${ozPath}`
            ],
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            },
            // Optimizer: enable for realistic gas estimates
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    const errors = output.errors ? output.errors.filter((err: any) => err.severity === 'error') : [];
    if (errors.length > 0) {
        const errorMessages = errors.map((err: any) => err.formattedMessage).join('\n');
        throw new Error(errorMessages);
    }

    const contracts = output.contracts['Contract.sol'];
    const contractNames = Object.keys(contracts);

    if (contractNames.length === 0) {
        throw new Error("No contracts found in the generated Solidity code.");
    }

    // Pick the last contract defined (usually the main one if inheriting)
    const mainContractName = contractNames[contractNames.length - 1];
    const contract = contracts[mainContractName];

    if (!contract.evm?.bytecode?.object) {
        throw new Error("Compilation produced no bytecode — contract may be abstract or an interface.");
    }

    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
        contractName: mainContractName
    };
}

/**
 * Resolves the path to @openzeppelin/contracts node_modules.
 * Tries multiple locations since the install layout varies.
 */
function resolveOpenZeppelinPath(): string {
    const candidates = [
        path.resolve(__dirname, '../../node_modules/@openzeppelin/contracts/'),
        path.resolve(process.cwd(), 'node_modules/@openzeppelin/contracts/'),
    ];

    for (const candidate of candidates) {
        try {
            // Quick existence check via require.resolve or fs
            require.resolve(path.join(candidate, 'package.json'));
            return candidate;
        } catch {
            continue;
        }
    }

    // Fallback: let solc try to resolve naturally (will fail gracefully)
    return candidates[0];
}
