import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

const agentService = new Agent_Service();

// GET /api/agents/[id]/wallet
export const GET: RequestHandler = async ({ params }) => {
    const agent_Id = params.id;
    if (!agent_Id) {
        return json({ success: false, error: 'Missing agent ID' }, { status: 400 });
    }
    try {
        const wallet = await agentService.get_Wallet(agent_Id);
        if (!wallet) {
            return json({ success: false, error: 'Wallet not found' }, { status: 404 });
        }
        return json({ success: true, data: { wallet_Address: wallet } });
    } catch (error) {
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};