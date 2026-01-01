import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Payment_Service } from '$lib/server/services/Payment_Service';

const paymentService = new Payment_Service();

// GET: Get pending transactions for the customer to pay
export const GET: RequestHandler = async () => {
    try {
        const pending = await paymentService.get_Pending_Transactions();
        return json({ success: true, data: pending });
    } catch (e) {
        return json({ success: false, error: String(e) }, { status: 500 });
    }
};

// PUT: Make Payment
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { transaction_Id } = await request.json();
        
        if (!transaction_Id) {
            return json({ success: false, error: 'Transaction ID required' }, { status: 400 });
        }

        await paymentService.update_Payment(transaction_Id);
        
        return json({ success: true, message: 'Payment recorded successfully' });
    } catch (error) {
        console.error("Payment API Error:", error);
        return json({ success: false, error: String(error) }, { status: 500 });
    }
};
