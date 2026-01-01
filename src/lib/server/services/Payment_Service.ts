import { Blockchain_Service } from './Blockchain_Service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const blockchainService = new Blockchain_Service();

export class Payment_Service {
    /**
     * Retrieves all pending (verified) transactions that are ready for payment.
     */
    async get_Pending_Transactions(): Promise<any[]> {
        return prisma.transaction.findMany({
            where: { status: 'pending' },
            include: {
                details: {
                    include: { item: true }
                }
            }
        });
    }

    /**
     * @param transaction_Id - UUID of the transaction to pay
     */
    async update_Payment(transaction_Id: string): Promise<void> {
        console.log(`[Payment Service] Initiating payment update for ${transaction_Id}...`);

        // 1. Update on Blockchain via Oracle Wallet
        await blockchainService.update_Payment_Status(transaction_Id);

        // 2. Update local DB status to 'paid'
        await prisma.transaction.update({
            where: { transaction_Id },
            data: { status: 'paid' }
        });

        console.log(`[Payment Service] Transaction ${transaction_Id} successfully marked as 'paid'.`);
    }
}
