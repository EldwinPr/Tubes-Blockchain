import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Audit_Service } from '../Audit_Service';
import { Blockchain_Service } from '../Blockchain_Service';
import { prisma } from '../../prisma';

// Mock Blockchain_Service
vi.mock('../Blockchain_Service');

describe('Audit_Service', () => {
    let auditService: Audit_Service;
    let agentId: string;

    beforeEach(async () => {
        auditService = new Audit_Service();
        vi.clearAllMocks();

        // Fetch the seeded agent
        const agent = await prisma.user.findUnique({
            where: { email: 'agent@example.com' }
        });

        if (!agent) {
            throw new Error('Seeded agent not found. Run npx prisma db seed first.');
        }
        agentId = agent.user_Id;
    });

    it('get_Transactions should return unaudited transactions', async () => {
        // Create a dummy transaction without auditor
        const tx = await prisma.transaction.create({
            data: {
                agent_Id: agentId,
                total_Amt: 100,
                total_Qty: 1,
                hash: 'some-hash',
                status: 'pending',
                details: {
                    create: []
                }
            }
        });

        const transactions = await auditService.get_Transactions();
        expect(Array.isArray(transactions)).toBe(true);
        
        // Ensure the created transaction is in the list
        // Note: transactions is 'any', assuming it returns an array of transaction objects
        const found = transactions.find((t: any) => t.transaction_Id === tx.transaction_Id);
        expect(found).toBeDefined();

        // Cleanup
        await prisma.transaction.delete({ where: { transaction_Id: tx.transaction_Id } });
    });

    it('check_Integrity should return true when hashes match', async () => {
        const mockHash = 'valid-hash';
        
        // Create a transaction in DB
        const tx = await prisma.transaction.create({
            data: {
                agent_Id: agentId,
                total_Amt: 100,
                total_Qty: 1,
                hash: mockHash,
                status: 'pending'
            }
        });

        // Mock Blockchain Service response
        const mockGetMetadata = vi.mocked(Blockchain_Service.prototype.get_Transaction_Metadata);
        mockGetMetadata.mockResolvedValue({
            payloadHash: mockHash,
            agentAddress: 'some-address',
            isVerified: true,
            isPaid: false,
            payload: {
                transaction_Id: tx.transaction_Id,
                total_Amt: 100,
                total_Qty: 1,
                timestamp: Date.now()
            }
        });

        const result = await auditService.check_Integrity(tx.transaction_Id);
        expect(result).toBe(true);

        // Cleanup
        await prisma.transaction.delete({ where: { transaction_Id: tx.transaction_Id } });
    });

    it('check_Integrity should return false when hashes mismatch', async () => {
        const dbHash = 'db-hash';
        const chainHash = 'chain-hash';
        
        const tx = await prisma.transaction.create({
            data: {
                agent_Id: agentId,
                total_Amt: 100,
                total_Qty: 1,
                hash: dbHash,
                status: 'pending'
            }
        });

        const mockGetMetadata = vi.mocked(Blockchain_Service.prototype.get_Transaction_Metadata);
        mockGetMetadata.mockResolvedValue({
            payloadHash: chainHash, // Mismatched hash
            agentAddress: 'some-address',
            isVerified: true,
            isPaid: false,
            payload: {
                transaction_Id: tx.transaction_Id,
                total_Amt: 100,
                total_Qty: 1,
                timestamp: Date.now()
            }
        });

        const result = await auditService.check_Integrity(tx.transaction_Id);
        expect(result).toBe(false);

        await prisma.transaction.delete({ where: { transaction_Id: tx.transaction_Id } });
    });

    it('flag_suspicious should update the suspicion flag', async () => {
        const tx = await prisma.transaction.create({
            data: {
                agent_Id: agentId,
                total_Amt: 100,
                total_Qty: 1,
                hash: 'clean-hash',
                status: 'pending',
                suspicion_Flag: false
            }
        });

        await auditService.flag_suspicious(tx.transaction_Id);

        const updatedTx = await prisma.transaction.findUnique({
            where: { transaction_Id: tx.transaction_Id }
        });

        expect(updatedTx?.suspicion_Flag).toBe(true);

        await prisma.transaction.delete({ where: { transaction_Id: tx.transaction_Id } });
    });
});
