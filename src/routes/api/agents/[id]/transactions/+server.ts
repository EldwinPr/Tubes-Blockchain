import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

// GET /api/agents/{id}/transactions
export const GET: RequestHandler = async ({ params }) => {
    const agent_Id = params.id;
    if (!agent_Id) {
        return json({ success: false, error: 'Missing agent ID' }, { status: 400 });
    }
    try {
        const agentService = new Agent_Service();
        const transactions = await agentService.get_Transactions(agent_Id);
        return json({ success: true, data: transactions });
    } catch (error) {
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};