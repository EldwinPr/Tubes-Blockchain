import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    try {
        // Fetch all users with role 'Agent'
        const agents = await prisma.user.findMany({
            where: {
                role: 'Agent'
            },
            select: {
                user_Id: true,
                name: true,
                email: true
            }
        });

        return json({ success: true, data: agents });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return json({ success: false, error: 'Failed to fetch agents' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};