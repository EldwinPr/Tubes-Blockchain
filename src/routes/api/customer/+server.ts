import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async () => {
    return json({ message: 'PUT /api/customer placeholder' });
};