// Placeholder for Audit_Service based on Class Diagram

import { prisma } from '../prisma';
import { Blockchain_Service } from './Blockchain_Service';

export class Audit_Service {
    private blockchainService: Blockchain_Service;

    constructor() {
        this.blockchainService = new Blockchain_Service();
    }

    /**
     * @returns set - Set of transactions
     */
    async get_Transactions(): Promise<any> {
        // Retrieve transactions for audit
        // We filter for transactions that have not been audited yet (auditor_Id is null)
        const transactions = await prisma.transaction.findMany({
            where: {
                auditor_Id: null
            },
            include: {
                agent: true,
                details: {
                    include: {
                        item: true
                    }
                }
            }
        });
        return transactions;
    }

    /**
     * @param uuid - Transaction UUID to check
     * @returns Object - { matches, blockchain }
     */
    async check_Integrity(uuid: string): Promise<{ matches: boolean, blockchain: any }> {
        // 1. Get the transaction from the database
        const dbTransaction = await prisma.transaction.findUnique({
            where: { transaction_Id: uuid }
        });

        if (!dbTransaction) {
            console.error(`Audit_Service: Transaction ${uuid} not found in DB.`);
            return { matches: false, blockchain: null };
        }

        // 2. Get the transaction metadata from the blockchain
        try {
            const blockchainData = await this.blockchainService.get_Transaction_Metadata(uuid);
            
            if (!blockchainData) {
                return { matches: false, blockchain: null };
            }

            // 3. Compare the hashes
            // Note: blockchainData.payloadHash vs dbTransaction.hash
            // Also we can check if it matches EXACTLY (keccak256 comparison logic is same)
            // Using Hashing_Service here would be cleaner but direct string comparison works if both are hex strings.
            // Let's assume standard string compare.
            
            const hashesMatch = blockchainData.payloadHash === dbTransaction.hash;

            return {
                matches: hashesMatch,
                blockchain: {
                    hash: blockchainData.payloadHash,
                    isVerified: blockchainData.isVerified,
                    isPaid: blockchainData.isPaid
                }
            };

        } catch (error) {
            console.error(`Audit_Service: Error fetching metadata for ${uuid} from blockchain.`, error);
            return { matches: false, blockchain: null };
        }
    }

    /**
     * @param uuid - Transaction UUID to flag
     */
    async flag_suspicious(uuid: string): Promise<void> {
        // Mark transaction as suspicious
        await prisma.transaction.update({
            where: { transaction_Id: uuid },
            data: {
                suspicion_Flag: true
            }
        });
        console.log(`Audit_Service: Transaction ${uuid} flagged as suspicious.`);
    }
}
