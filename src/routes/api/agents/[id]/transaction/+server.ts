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
        
        // Validate items array
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return json({ success: false, error: 'Missing or invalid items array' }, { status: 400 });
        }

        // Prepare data for service
        const transactionData = { 
            agent_Id: params.id,
            items: body.items 
        };

        // Call service
        try {
            const result = await agentService.input_Transaction(transactionData);
            return json({ success: true, data: result });
        } catch (error: unknown) {
            console.error('Transaction Input Error:', error);
            
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Check for known errors (e.g., Item not found)
            if (errorMessage.includes('Item not found')) {
                 return json({ success: false, error: errorMessage }, { status: 404 });
            }

            // Default server error
            return json({ success: false, error: 'Internal Server Error: ' + errorMessage }, { status: 500 });
        }
    } catch (error) {
        return json({ success: false, error: 'Invalid Request Body' }, { status: 400 });
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
