import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

const agentService = new Agent_Service();

// GET /api/agents/items?item_Id=xxx
export const GET: RequestHandler = async ({ url }) => {
    const item_Id = url.searchParams.get('item_Id');
    try {
        const result = await agentService.get_Items(item_Id || undefined);
        if (item_Id) {
            if (!result) {
                return json({ success: false, error: 'Item not found' }, { status: 404 });
            }
            return json({ success: true, data: result });
        } else {
            return json({ success: true, data: result });
        }
    } catch (error) {
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};