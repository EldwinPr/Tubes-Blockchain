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
     * @returns boolean - True if integrity is verified
     */
    async check_Integrity(uuid: string): Promise<boolean> {
        // 1. Get the transaction from the database
        const dbTransaction = await prisma.transaction.findUnique({
            where: { transaction_Id: uuid }
        });

        if (!dbTransaction) {
            console.error(`Audit_Service: Transaction ${uuid} not found in DB.`);
            return false;
        }

        // 2. Get the transaction metadata from the blockchain
        try {
            const blockchainData = await this.blockchainService.get_Transaction_Metadata(uuid);
            
            // 3. Compare the hashes
            // Note: Blockchain service returns payloadHash
            if (blockchainData && blockchainData.payloadHash === dbTransaction.hash) {
                return true;
            } else {
                console.warn(`Audit_Service: Integrity check failed for ${uuid}. DB Hash: ${dbTransaction.hash}, Chain Hash: ${blockchainData?.payloadHash}`);
                return false;
            }
        } catch (error) {
            console.error(`Audit_Service: Error fetching metadata for ${uuid} from blockchain.`, error);
            return false;
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
