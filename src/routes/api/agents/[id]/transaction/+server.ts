import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
    return json({ message: `POST /api/agents/${params.id}/transaction placeholder` });
};

export const PUT: RequestHandler = async ({ params }) => {
    return json({ message: `PUT /api/agents/${params.id}/transaction placeholder` });
};