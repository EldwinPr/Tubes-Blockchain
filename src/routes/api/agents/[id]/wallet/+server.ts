import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

const agentService = new Agent_Service();

export const GET: RequestHandler = async ({ params }) => {
    try {
        const wallet = await agentService.get_Wallet(params.id);
        if (!wallet) return json({ error: 'Agent not found' }, { status: 404 });
        return json(wallet);
    } catch (error) {
        return json({ error: String(error) }, { status: 500 });
    }
};