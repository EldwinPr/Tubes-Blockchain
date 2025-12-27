import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params }) => {
    return json({ message: `PUT /api/auditors/${params.id}/commission/${params.tx_id} placeholder` });
};