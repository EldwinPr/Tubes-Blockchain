import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

const ABI = [
    "event SaleRecorded(string transactionId, address indexed agent, string hash)",
    "function sales(string) view returns (address agent, tuple(string transactionId, uint256 totalAmt, uint256 totalQty, uint256 timestamp) payload, string txHash, bool isVerified, bool isPaid)"
];

async function main() {
    console.log(`Scanning for ALL sales on ${CONTRACT_ADDRESS}...`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, provider);

    // 1. Fetch all SaleRecorded events
    // We scan from block 0 (or a recent block if we knew deployment height, but 0 is safe/lazy)
    // Note: Public RPCs might limit range, so we might need to paginate if it fails.
    // We'll try fetching last 100,000 blocks which is usually enough for a testnet deploy.
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock - 50000; // Scan last ~50k blocks (adjust if deployed earlier)
    
    console.log(`Querying events from block ${fromBlock} to ${currentBlock}...`);
    
    const events = await contract.queryFilter("SaleRecorded", fromBlock, currentBlock);
    console.log(`Found ${events.length} sales events.`);

    console.log("\n--- SALES REPORT ---");
    
    for (const event of events) {
        if (event instanceof ethers.EventLog) {
            const uuid = event.args[0];
            
            // 2. Fetch current status from storage
            const data = await contract.sales(uuid);
            const isVerified = data[3]; // data.isVerified
            const payload = data[1];    // data.payload tuple

            // Use array indices for the nested tuple: [id, amt, qty, time]
            const amt = payload[1];
            const qty = payload[2];

            console.log(`ID: ${uuid} | Verified: ${isVerified ? "✅" : "❌"} | Qty: ${qty} | Amt: ${amt}`);
        }
    }
}

main();
