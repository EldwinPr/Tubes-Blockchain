import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ params }) => {
    try {
        // Verify the auditor exists
        const auditor = await prisma.user.findUnique({
            where: {
                user_Id: params.id
            }
        });

        if (!auditor || auditor.role !== 'Auditor') {
            return json({ success: false, error: 'Auditor not found' }, { status: 404 });
        }

        // Fetch unverified/pending transactions that may need auditing
        const transactions = await prisma.transaction.findMany({
            where: {
                status: { in: ['unverified', 'pending'] } // Only fetch transactions that need auditing
            },
            include: {
                details: {
                    include: {
                        item: true
                    }
                }
            }
        });

        return json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};