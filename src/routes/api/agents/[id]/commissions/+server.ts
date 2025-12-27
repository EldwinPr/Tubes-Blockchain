import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    return json({ message: `GET /api/agents/${params.id}/commissions placeholder` });
};