import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Audit_Service } from '$lib/server/services/Audit_Service';

const auditService = new Audit_Service();

export const GET: RequestHandler = async ({ params }) => {
    const txId = params.tx_id;
    if (!txId) return json({ success: false, error: 'Transaction ID required' }, { status: 400 });

    try {
        const result = await auditService.check_Integrity(txId);
        return json({ 
            success: true, 
            isIntegrityVerified: result.matches, 
            blockchainData: result.blockchain 
        });
    } catch (e) {
        return json({ success: false, error: String(e) }, { status: 500 });
    }
};