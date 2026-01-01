import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { Hashing_Service } from './Hashing_Service';
import { Agent_Service } from './Agent_Service';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const agentService = new Agent_Service();

// Minimal ABI for the events and functions we need
const CONTRACT_ABI = [
    "event SaleRecorded(string transactionId, address indexed agent, string hash)",
    "function verify_transaction(string transactionId, string oracleHash, address oracleWallet) external",
    "function update_payment(string transactionId) external",
    "function sales(string) view returns (address agent, tuple(string transactionId, uint256 totalAmt, uint256 totalQty, uint256 timestamp) payload, string txHash, bool isVerified, bool isPaid)"
];

export class Blockchain_Service {
    private provider: ethers.JsonRpcProvider | ethers.WebSocketProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private contractAddress: string;

    constructor() {
        // Initialize Provider (Amoy or Local Hardhat)
        const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        // Optimize polling for public testnets to avoid 'filter not found' errors
        this.provider.pollingInterval = 5000; // Check every 5 seconds

        // Initialize Oracle Wallet
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            console.warn("Blockchain_Service: No PRIVATE_KEY found in env. Oracle functions will fail.");
            this.wallet = ethers.Wallet.createRandom(this.provider); // Fallback for safety
        } else {
            this.wallet = new ethers.Wallet(privateKey, this.provider);
        }

        // Contract Setup
        this.contractAddress = process.env.CONTRACT_ADDRESS || "";
        this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.wallet);
    }
    
    /**
     * Retrieves the off-chain "Truth" (Hash and Wallet Address) for a transaction.
     * Used by the Oracle to verify data origin and integrity.
     */
    async get_HashWallet(transaction_Id: string): Promise<{ hash: string, agent_Wallet_Address: string } | null> {
        const transaction = await prisma.transaction.findUnique({
            where: { transaction_Id },
            include: {
                agent: {
                    select: {
                        wallet_Address: true
                    }
                }
            }
        });

        if (!transaction) {
            return null;
        }

        return {
            hash: transaction.hash,
            agent_Wallet_Address: transaction.agent.wallet_Address
        };
    }

    /**
     * Starts the Oracle Listener to watch for new Sales on the Blockchain.
     * Uses manual polling to be robust against public RPC 'filter not found' errors.
     * Must be called once at server startup.
     */
    async start_Oracle_Listener() {
        if (!this.contractAddress) {
            console.error("Oracle Listener: No Contract Address configured.");
            return;
        }

        console.log(`Oracle Listener started on ${this.contractAddress}...`);

        let lastProcessedBlock = await this.provider.getBlockNumber();
        console.log(`[Oracle] Starting poll from block: ${lastProcessedBlock}`);

        const poll = async () => {
            try {
                const currentBlock = await this.provider.getBlockNumber();

                if (currentBlock > lastProcessedBlock) {
                    // Query logs from last processed block + 1 to current block
                    const events = await this.contract.queryFilter("SaleRecorded", lastProcessedBlock + 1, currentBlock);

                    for (const event of events) {
                        if (event instanceof ethers.EventLog) {
                            const transactionId = event.args[0];
                            const agentAddress = event.args[1];
                            const chainHash = event.args[2];

                            console.log(`[Oracle] Event Detected: SaleRecorded for ${transactionId} (Block ${event.blockNumber})`);
                            console.log(`[Oracle] Chain Data -> Hash: ${chainHash}, Agent: ${agentAddress}`);
                            
                            await this.process_Event(transactionId, agentAddress, chainHash);
                        }
                    }

                    lastProcessedBlock = currentBlock;
                }
            } catch (error) {
                console.error("[Oracle] Polling Error:", error);
            }
            
            // Schedule next poll
            setTimeout(poll, 5000); 
        };

        poll();
    }

    /**
     * Helper to process a detected event.
     */
    async process_Event(transactionId: string, agentAddress: string, chainHash: string) {
        try {
            // 1. Fetch Truth from Database
            const dbData = await this.get_HashWallet(transactionId);
            
            if (!dbData) {
                console.error(`[Oracle] Error: Transaction ${transactionId} not found in DB! Cannot verify.`);
                return;
            }

            // 2. Check if ALREADY verified on-chain (Idempotency)
            const currentChainState = await this.contract.sales(transactionId);
            const isAlreadyVerified = currentChainState[3]; // .isVerified

            if (isAlreadyVerified) {
                console.log(`[Oracle] Transaction ${transactionId} is ALREADY verified on-chain. Syncing DB...`);
                await agentService.finalize_Transaction(transactionId);
                return;
            }

            // 3. Submit "Truth" to Blockchain for ON-CHAIN comparison
            const verificationPassed = await this.verify_Transaction_OnChain(transactionId, dbData.hash, dbData.agent_Wallet_Address);

            if (verificationPassed) {
                // Finalize in DB (Update status to 'pending') ONLY if chain verification passed
                await agentService.finalize_Transaction(transactionId);
            } else {
                console.warn(`[Oracle] On-Chain Verification FAILED (Checked Storage). Database status NOT updated.`);
            }

        } catch (error) {
            console.error("[Oracle] Error processing event:", error);
        }
    }

    /**
     * Submits the database truth to the Smart Contract.
     * Returns true if the contract storage says isVerified = true.
     */
    async verify_Transaction_OnChain(transactionId: string, dbHash: string, dbWallet: string): Promise<boolean> {
        try {
            console.log(`[Oracle] Sending verification for ${transactionId}...`);
            
            // Gas Overrides for Amoy stability
            const tx = await this.contract.verify_transaction(transactionId, dbHash, dbWallet, {
                gasLimit: 500000,
                maxFeePerGas: ethers.parseUnits('100', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei')
            });

            console.log(`[Oracle] Transaction sent: ${tx.hash}. Waiting for confirmation...`);
            await tx.wait();
            console.log(`[Oracle] Transaction confirmed.`);

            // Direct check of storage state
            const saleData = await this.contract.sales(transactionId);
            const isVerified = saleData[3]; 
            
            return isVerified;

        } catch (error) {
            console.error("[Oracle] Failed to submit verification transaction:", error);
            throw error;
        }
    }

    /**
     * @param uuid - UUID of the transaction
     * @returns Set - Transaction metadata from blockchain
     */
    async get_Transaction_Metadata(uuid: string): Promise<any> {
        // TODO: Implement logic to fetch metadata from Smart Contract via ethers.js
        return null;
    }

    /**
     * @param uuid - UUID of the transaction
     * @returns String - Status update result
     */
    async update_Payment_Status(uuid: string): Promise<string> {
        try {
             const tx = await this.contract.update_payment(uuid);
             await tx.wait();
             return tx.hash;
        } catch (error) {
            console.error("Payment Update Failed:", error);
            throw error;
        }
    } 
}
