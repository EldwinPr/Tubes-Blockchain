import { Blockchain_Service } from '../src/lib/server/services/Blockchain_Service';

async function main() {
    const uuid = process.argv[2];
    if (!uuid) {
        console.error("Usage: npx tsx scripts/test_transaction_metadata.ts <UUID>");
        process.exit(1);
    }

    console.log(`Testing transaction metadata for UUID: ${uuid}...`);

    const blockchainService = new Blockchain_Service();

    try {
        const result = await blockchainService.get_Transaction_Metadata(uuid);
        
        console.log("\n--- JSON OUTPUT ---");
        console.log(JSON.stringify(result, null, 2));

        console.log("\n--- FORMATTED OUTPUT (similar to check_storage.ts) ---");
        console.log("\n--- ON-CHAIN DATA ---");
        console.log(`Agent Address:  ${result.agentAddress}`);
        console.log(`Verified?       ${result.isVerified ? "✅ YES" : "❌ NO"}`);
        console.log(`Paid?           ${result.isPaid ? "✅ YES" : "❌ NO"}`);
        console.log(`Payload Hash:   ${result.payloadHash}`);

        console.log("\n--- PAYLOAD DETAILS ---");
        if (result.payload.timestamp === 0) {
             console.log("⚠️  RECORD NOT FOUND (Empty Payload)");
        } else {
            console.log(`ID:             ${result.payload.transaction_Id}`);
            console.log(`Total Amount:   ${result.payload.total_Amt}`);
            console.log(`Total Qty:      ${result.payload.total_Qty}`);
            console.log(`Timestamp:      ${new Date(result.payload.timestamp).toLocaleString()}`);
        }

    } catch (error) {
        console.error("Error getting transaction metadata:", error);
    }
}

main();