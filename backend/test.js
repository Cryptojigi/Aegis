"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function testBuilder() {
    console.log("🚀 Testing Aegis Builder Endpoint...");
    try {
        const response = await fetch("http://localhost:3001/api/a2a/build-and-deploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: "Create a simple ERC20 token called 'AegisTest' with symbol 'AGT'. Total supply should be 1 million.",
                constructorArgs: []
            })
        });
        const data = await response.json();
        console.log("\n✅ Response Received:");
        console.log(JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}
testBuilder();
//# sourceMappingURL=test.js.map