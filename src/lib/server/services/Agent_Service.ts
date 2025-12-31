import { PrismaClient } from '@prisma/client';
import { Hashing_Service } from './Hashing_Service';
const prisma = new PrismaClient();

// Placeholder for Agent_Service based on Class Diagram

export class Agent_Service {
    /**
     * @param uuid - Agent UUID
     * @returns array - List of transactions
     */
    async get_Transactions(uuid: string): Promise<any[]> {
        // TODO: Retrieve transactions for the agent
        return [];
    }

    /**
     * @param uuid - Item or Category UUID? (Assumed based on diagram)
     * @returns any - List of items
     */
    async get_Items(item_Id: string): Promise<any> {
        // Retrieve a single item by item_Id
        return prisma.item.findUnique({
            where: { item_Id }
        });
    }

    /**
     * @param set - Transaction data set
     * @returns object - { payload, server_signature, hash }
     * 
     * FLOW INPUT TRANSACTION:
     * 1. Validate input data (items, qty, prices).
     * 2. Save preliminary data to local DB (status: Pending).
     * 3. Compute Hash of the critical data.
     * 4. SIGN the hash using SERVER'S PRIVATE KEY.
     * 5. Return { payload, server_signature, hash } to Frontend.
     * 
     * NEXT STEP (Frontend):
     * - Frontend sends this payload + signature to Smart Contract.
     * - Smart Contract verifies signature (to ensure data origin).
     * - Smart Contract calls Oracle to verify prices.
     */
    async input_Transaction(set: any): Promise<any> {
        // 1. Get item price from Item table using get_Items
        const item = await this.get_Items(set.item_Id);
        if (!item) {
            throw new Error('Item not found');
        }
        const price_At_Time = item.price;
        const qty = set.qty;
        const total_Amt = qty * price_At_Time;

        // 2. Create Transaction (status: Pending, suspicion_Flag: false, auditor_id: null)
        const transaction = await prisma.transaction.create({
            data: {
                agent_Id: set.agent_Id,
                auditor_Id: null,
                total_Amt: total_Amt,
                status: 'Pending',
                suspicion_Flag: false
            }
        });

        // 3. Create Transaction_Details
        const transactionDetail = await prisma.transaction_Details.create({
            data: {
                transaction_Id: transaction.transaction_Id,
                item_Id: set.item_Id,
                qty: qty,
                price_At_Time: price_At_Time
            }
        });

        // 4. Prepare payload
        const payload = {
            items: [{ itemId: set.item_Id, qty, price: price_At_Time }],
            total_Amt
        };

        // 5. Generate a hash as the 'signature' using Hashing_Service
        const { transaction_Id } = transaction;
        const signature = Hashing_Service.generate_Transaction_Hash({
            transaction_Id,
            agent_Id: set.agent_Id,
            total_Amt,
            item_Id: set.item_Id,
            qty,
            price_At_Time
        });

        // 6. Return response
        return {
            transaction_Id: transaction.transaction_Id,
            payload,
            signature
        };
    }

    /**
     * @param uuid - Agent UUID
     * @returns array - List of commissions
     */
    async get_Commissions(uuid: string): Promise<any[]> {
        // TODO: Retrieve commissions for the agent
        return [];
    }

    /**
     * @param uuid - Agent UUID
     * @returns string - Wallet address
     */
    async get_Wallet(uuid: string): Promise<string> {
        // TODO: Retrieve agent's wallet address
        return "";
    }

    /**
     * @param tx_Hash - Transaction Hash from Blockchain
     * 
     * CALLED AFTER: Smart Contract execution & Oracle check is success.
     */
    async finalize_Transaction(tx_Hash: string): Promise<void> {
        // TODO: Finalize transaction
        // 1. Verify tx_Hash exists on chain.
        // 2. Update local DB status to 'Committed'.
        // 3. Link tx_Hash to the transaction record.
    }

    /**
     * Helper to sign data using Server's Private Key.
     */
    async sign_Transaction(dataHash: string): Promise<string> {
        // TODO: Implement cryptographic signing
        return "0xServerSignature...";
    }
}
