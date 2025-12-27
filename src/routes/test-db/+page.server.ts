import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const userCount = await prisma.user.count();
        return {
            status: 'Success',
            message: 'Koneksi ke database berhasil!',
            count: userCount
        };
    } catch (error) {
        console.error('Database connection error:', error);
        return {
            status: 'Error',
            message: 'Gagal terhubung ke database.',
            error: String(error)
        };
    }
};
