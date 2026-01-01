import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    try {
        // Fetch all users with role 'Auditor'
        const auditors = await prisma.user.findMany({
            where: {
                role: 'Auditor'
            },
            select: {
                user_Id: true,
                name: true,
                email: true
            }
        });

        return json({ success: true, data: auditors });
    } catch (error) {
        console.error('Error fetching auditors:', error);
        return json({ success: false, error: 'Failed to fetch auditors' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};