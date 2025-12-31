import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        console.log("Loading agent from database...");
        // Mencari agent pertama di database untuk keperluan demo/testing frontend
        const agent = await prisma.user.findFirst({
            where: { role: 'Agent' }
        });
        console.log("Found agent:", agent);

        return {
            agentId: agent?.user_Id || 'agent-not-found'
        };
    } catch (error) {
        console.error("Error loading agent:", error);
        return {
            agentId: 'error-loading-agent'
        };
    }
};
