"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileContract = compileContract;
const solc_1 = __importDefault(require("solc"));
/**
 * Compiles Solidity code using solc.
 * Returns the ABI and Bytecode of the first contract found.
 * If compilation fails, throws an Error with the solc error messages.
 */
function compileContract(sourceCode) {
    const input = {
        language: 'Solidity',
        sources: {
            'Contract.sol': {
                content: sourceCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    const output = JSON.parse(solc_1.default.compile(JSON.stringify(input)));
    const errors = output.errors ? output.errors.filter((err) => err.severity === 'error') : [];
    if (errors.length > 0) {
        const errorMessages = errors.map((err) => err.formattedMessage).join('\n');
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
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
        contractName: mainContractName
    };
}
//# sourceMappingURL=compiler.js.map