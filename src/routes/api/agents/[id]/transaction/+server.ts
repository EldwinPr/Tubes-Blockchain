import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Agent_Service } from '$lib/server/services/Agent_Service';

const agentService = new Agent_Service();

// POST: Input Transaction
// Returns: { success: true, data: { payload, signature, hash } }
export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const body = await request.json();
        // Validate agent ID from params
        if (!params.id || typeof params.id !== 'string' || params.id.length > 64) {
            return json({ success: false, error: 'Invalid or missing agent ID' }, { status: 400 });
        }
        // Validate required fields
        if (!body.total_amt || !body.item_id || !body.qty) {
            return json({ success: false, error: 'Missing required fields: total_amt, item_id, qty' }, { status: 400 });
        }
        // Inject agent ID from URL params into the body/set if needed
        const transactionData = { ...body, agent_Id: params.id };

        // This will call the service which handles DB save AND Signing
        const result = await agentService.input_Transaction(transactionData);

        return json({ success: true, data: result });
    } catch (error) {
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};

// PUT: Finalize Transaction
// Body: { tx_Hash: string }
export const PUT: RequestHandler = async ({ request, params }) => {
    try {
        const { tx_Hash } = await request.json();
        if (!tx_Hash) {
            return json({ success: false, message: 'tx_Hash is required' }, { status: 400 });
        }
        
        // Finalize transaction (sync status with blockchain)
        await agentService.finalize_Transaction(tx_Hash);
        
        return json({ success: true, message: 'Transaction finalized' });
    } catch (error) {
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};
