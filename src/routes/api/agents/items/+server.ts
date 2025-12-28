import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

const agentService = new Agent_Service();

export const GET: RequestHandler = async () => {
    try {
        const items = await agentService.get_Items();
        return json(items);
    } catch (error) {
        return json({ error: String(error) }, { status: 500 });
    }
};