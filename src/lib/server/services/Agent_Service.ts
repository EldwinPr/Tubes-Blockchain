import { PrismaClient, type Item, type Transaction, type User, Prisma } from '@prisma/client';
import { Hashing_Service } from './Hashing_Service';
import crypto from 'node:crypto';
import type { TransactionInput, TransactionResult } from '$lib/types';

const prisma = new PrismaClient();

// Define a type for Transaction with included details
type TransactionWithDetails = Prisma.TransactionGetPayload<{
    include: { details: { include: { item: true } } }
}>;

export class Agent_Service {
    /**
     * Retrieve all transactions for a given agent UUID.
     * @param agent_Id - Agent UUID
     * @returns array - List of transactions for the agent
     */
    async get_Transactions(agent_Id: string): Promise<TransactionWithDetails[]> {
        return prisma.transaction.findMany({
            where: { agent_Id },
            include: {
                details: {
                    include: {
                        item: true
                    }
                }
            }
        });
    }


    /**
     * Get items from the database.
     * @param item_Id - (Optional) Item UUID. If provided, returns a single item. If omitted, returns all items.
     * @returns A single item object if item_Id is provided, or an array of items if not.
     */
    async get_Items(item_Id?: string): Promise<Item | Item[] | null> {
        if (item_Id) {
            // Retrieve a single item by item_Id
            return prisma.item.findUnique({
                where: { item_Id }
            });
        } else {
            // Retrieve all items
            return prisma.item.findMany();
        }
    }

    /**
     * @param set - Transaction data set { agent_Id, items: [{ item_Id, qty }] }
     * @returns object - { payload, hash }
     * 
     * FLOW INPUT TRANSACTION:
     * 1. Validate input data (items, qty, prices).
     * 2. Generate Transaction ID and Timestamp.
     * 3. Compute Hash of the critical data (Payload).
     * 4. Save data to local DB (status: unverified).
     * 5. Return { payload, hash } to Frontend.
     */
    async input_Transaction(set: TransactionInput): Promise<TransactionResult> {
        let total_Amt = 0;
        let total_Qty = 0;
        const transaction_Details_Data = [];

        // 1. Calculate Totals and Prepare Details
        for (const itemInput of set.items) {
            const item = await prisma.item.findUnique({ where: { item_Id: itemInput.item_Id } });
            if (!item) {
                throw new Error(`Item not found: ${itemInput.item_Id}`);
            }
            const lineTotal = itemInput.qty * item.price;
            total_Amt += lineTotal;
            total_Qty += itemInput.qty;

            transaction_Details_Data.push({
                item_Id: itemInput.item_Id,
                qty: itemInput.qty,
                price_At_Time: item.price
            });
        }

        // 2. Generate Metadata
        const transaction_Id = crypto.randomUUID();
        const timestamp = Date.now();

        // 3. Create Payload
        const payload = {
            transaction_Id,
            total_Amt,
            total_Qty,
            timestamp
        };

        // 4. Generate Hash
        const hash = Hashing_Service.generate_Transaction_Hash(payload);

        // 5. Save to DB (using the pre-generated ID and Hash)
        await prisma.transaction.create({
            data: {
                transaction_Id: transaction_Id,
                agent_Id: set.agent_Id,
                auditor_Id: null,
                total_Amt: total_Amt,
                total_Qty: total_Qty,
                hash: hash,
                status: 'unverified',
                suspicion_Flag: false,
                details: {
                    create: transaction_Details_Data
                }
            }
        });

        // 6. Return response
        return {
            payload,
            hash
        };
    }

    /**
     * @param uuid - Agent UUID
     * @returns array - List of commissions
     */
    async get_Commissions(uuid: string): Promise<any[]> {
        // TODO: Retrieve commissions for the agent (returning empty array for now)
        return [];
    }

    /**
     * @param uuid - Agent UUID
     * @returns object - User details (name, wallet, role)
     */
    async get_Wallet(uuid: string): Promise<Partial<User> | null> {
        return prisma.user.findUnique({
            where: { user_Id: uuid },
            select: { 
                name: true,
                wallet_Address: true,
                role: true
            }
        });
    }

    /**
     * @param transaction_Id - Transaction UUID
     * @param tx_Hash - (Optional) The on-chain hash if we want to store the verification tx hash, 
     *                  but mainly this updates status to 'pending'.
     */
    async finalize_Transaction(transaction_Id: string): Promise<void> {
        await prisma.transaction.update({
            where: { transaction_Id },
            data: {
                status: 'pending' // Update from 'unverified' to 'pending' (Verified by Oracle)
            }
        });
        console.log(`[Agent Service] Transaction ${transaction_Id} finalized to 'pending'.`);
    }
}
