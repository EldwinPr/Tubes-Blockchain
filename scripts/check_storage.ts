import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// The ABI for reading the 'sales' mapping
// Mapping string => Struct(agent, Payload(id, amt, qty, time), hash, verified, paid)
const ABI = [
    "function sales(string) view returns (address agent, tuple(string transactionId, uint256 totalAmt, uint256 totalQty, uint256 timestamp) payload, string txHash, bool isVerified, bool isPaid)"
];

async function main() {
    const uuid = process.argv[2];
    if (!uuid) {
        console.error("Usage: npx tsx scripts/check_storage.ts <UUID>");
        process.exit(1);
    }

    console.log(`Checking storage for UUID: ${uuid}...`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, provider);

    try {
        const result = await contract.sales(uuid);
        
        // Ethers returns a Result object/array
        const agent = result[0];
        const payload = result[1];
        const txHash = result[2];
        const isVerified = result[3];
        const isPaid = result[4];

        console.log("\n--- ON-CHAIN DATA ---");
        console.log(`Agent Address:  ${agent}`);
        console.log(`Verified?       ${isVerified ? "✅ YES" : "❌ NO"}`);
        console.log(`Paid?           ${isPaid ? "✅ YES" : "❌ NO"}`);
        console.log(`Payload Hash:   ${txHash}`);
        
        console.log("\n--- PAYLOAD DETAILS ---");
        if (payload[3] === 0n) {
             console.log("⚠️  RECORD NOT FOUND (Empty Payload)");
        } else {
            console.log(`ID:             ${payload[0]}`);
            console.log(`Total Amount:   ${payload[1]}`); // BigInt
            console.log(`Total Qty:      ${payload[2]}`); // BigInt
            console.log(`Timestamp:      ${new Date(Number(payload[3])).toLocaleString()}`);
        }

    } catch (error) {
        console.error("Error reading contract:", error);
    }
}

main();
