import { prisma } from '$lib/server/prisma';

export class Agent_Service {
    /**
     * @param uuid - Agent UUID
     * @returns array - List of transactions
     */
    async get_Transactions(uuid: string): Promise<any[]> {
        return await prisma.transaction.findMany({
            where: { agent_Id: uuid },
            include: {
                details: {
                    include: { item: true }
                }
            },
            orderBy: { transaction_Id: 'desc' }
        });
    }

    /**
     * @returns any - List of available items
     */
    async get_Items(): Promise<any[]> {
        return await prisma.item.findMany();
    }

    /**
     * @param set - Transaction data set
     * @returns object - { payload, server_signature, hash }
     */
    async input_Transaction(set: any): Promise<any> {
        // MOCK IMPLEMENTATION FOR FRONTEND TESTING
        // Logic sebenarnya akan diimplementasikan oleh Backend Developer (Hashing & Signing)
        
        // Return dummy data agar frontend tidak error saat klik Validate
        return {
            payload: {
                transaction_Id: "mock-tx-id-" + Date.now(),
                total_Amt: 100000000,
                items: set.items
            },
            server_signature: "0xMockSignatureFromBackend",
            hash: "0xMockHash"
        };
    }

    /**
     * @param uuid - Agent UUID
     * @returns array - List of commissions
     */
    async get_Commissions(uuid: string): Promise<any[]> {
        return await prisma.commission.findMany({
            where: { transaction: { agent_Id: uuid } }
        });
    }

    /**
     * @param uuid - Agent UUID
     * @returns object - Wallet info
     */
    async get_Wallet(uuid: string): Promise<any> {
        const user = await prisma.user.findUnique({
            where: { user_Id: uuid },
            select: { name: true, wallet_Address: true, role: true }
        });
        return user;
    }

    /**
     * @param tx_Hash - Transaction Hash from Blockchain
     */
    async finalize_Transaction(tx_Hash: string): Promise<void> {
        // Placeholder
        console.log("Finalizing transaction with hash:", tx_Hash);
    }
    
    async sign_Transaction(dataHash: string): Promise<string> {
        return "0xServerSignature...";
    }
}
