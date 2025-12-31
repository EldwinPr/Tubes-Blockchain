import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Blockchain_Service {
    
    /**
     * Retrieves the off-chain "Truth" (Hash and Wallet Address) for a transaction.
     * Used by the Oracle to verify data origin and integrity.
     * 
     * @param transaction_Id - UUID of the transaction
     * @returns object - { hash, agent_Wallet_Address }
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
        // TODO: Implement logic to update payment status on blockchain
        // This likely involves calling a Smart Contract function via ethers.js using a private key.
        return "";
    } 
}
