import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Mencari agent pertama di database untuk keperluan demo/testing frontend
    const agent = await prisma.user.findFirst({
        where: { role: 'Agent' }
    });

    return {
        agentId: agent?.user_Id || 'agent-not-found'
    };
};
